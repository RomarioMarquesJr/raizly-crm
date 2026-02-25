'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateLeadStageAction(leadId: string, newStageId: string) {
    const supabase = await createClient()

    // Find if the new stage is closed_won
    const { data: stageData, error: stageError } = await supabase
        .from('pipeline_stages')
        .select('is_closed_won')
        .eq('id', newStageId)
        .single()

    if (stageError) throw new Error(stageError.message)

    // Determine the status automatically based on whether the target stage is "won"
    const newStatus = stageData?.is_closed_won ? 'won' : 'open'

    // Update lead stage and status
    const { error } = await supabase
        .from('leads')
        .update({
            stage_id: newStageId,
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', leadId)

    if (error) {
        throw new Error(error.message)
    }

    // Get lead info for event & audit log
    const { data: leadData } = await supabase
        .from('leads')
        .select('company_id')
        .eq('id', leadId)
        .single()

    const { data: authData } = await supabase.auth.getUser()

    if (leadData && authData.user) {
        await supabase.from('lead_timeline_events').insert({
            lead_id: leadId,
            company_id: leadData.company_id,
            user_id: authData.user.id,
            type: 'stage_change',
            content: `Moved lead to a new stage`,
        })

        // Audit log
        await supabase.from('audit_log').insert({
            company_id: leadData.company_id,
            user_id: authData.user.id,
            action: 'UPDATE',
            entity_type: 'lead',
            entity_id: leadId,
            new_data: { stage_id: newStageId }
        })
    }

    revalidatePath('/')
    return { success: true }
}

export async function fetchLeadsAction(companyId?: string) {
    const supabase = await createClient()
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (companyId) {
        query = query.eq('company_id', companyId)
    }
    const { data: leads, error } = await query
    if (error) throw new Error(error.message)
    return leads
}

export async function fetchLeadDetailsAction(leadId: string) {
    const supabase = await createClient()
    const [leadRes, timelineRes, remindersRes] = await Promise.all([
        supabase.from('leads').select('*').eq('id', leadId).single(),
        supabase.from('lead_timeline_events').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
        supabase.from('reminders').select('*').eq('lead_id', leadId).eq('is_completed', false).order('due_date', { ascending: true }),
    ])
    if (leadRes.error) throw new Error(leadRes.error.message)
    return {
        lead: leadRes.data,
        timeline: timelineRes.data || [],
        reminders: remindersRes.data || [],
    }
}

export async function fetchRemindersAction(leadId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('lead_id', leadId)
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

export async function fetchPipelineStagesAction(companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('company_id', companyId)
        .order('order', { ascending: true })
    if (error) throw new Error(error.message)
    return data
}

export async function fetchDashboardDataAction(companyId: string) {
    const supabase = await createClient()
    const [leadsRes, remindersRes, stagesRes] = await Promise.all([
        supabase.from('leads').select('*').eq('company_id', companyId),
        supabase.from('reminders').select('*').eq('company_id', companyId).eq('is_completed', false),
        supabase.from('pipeline_stages').select('*').eq('company_id', companyId).order('order', { ascending: true }),
    ])
    return {
        leads: leadsRes.data || [],
        reminders: remindersRes.data || [],
        stages: stagesRes.data || [],
    }
}

export async function createLeadAction(data: { name: string; company_name: string; value: number; email: string; phone: string }) {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) throw new Error("Not authenticated")

    const { data: memberData } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', authData.user.id)
        .limit(1)
        .maybeSingle()

    if (!memberData) throw new Error("No company found")

    // Get the first stage
    const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('company_id', memberData.company_id)
        .order('order', { ascending: true })
        .limit(1)

    const stageId = stages?.[0]?.id

    if (!stageId) throw new Error("No pipeline stages found")

    const { error } = await supabase.from('leads').insert({
        company_id: memberData.company_id,
        stage_id: stageId,
        name: data.name,
        company_name: data.company_name,
        value: data.value,
        email: data.email,
        phone: data.phone,
        status: 'open'
    })

    if (error) throw new Error(error.message)

    revalidatePath('/')
    return { success: true }
}

export async function createReminderAction(leadId: string, companyId: string, title: string, dueDate: string) {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) throw new Error("Not authenticated")

    const { error } = await supabase.from('reminders').insert({
        lead_id: leadId,
        company_id: companyId,
        user_id: authData.user.id,
        title,
        due_date: dueDate,
    })

    if (error) throw new Error(error.message)
    revalidatePath('/')
}

export async function completeReminderAction(reminderId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)

    if (error) throw new Error(error.message)
    revalidatePath('/')
}

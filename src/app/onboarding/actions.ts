'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function createCompany(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const companyName = formData.get('companyName') as string
    if (!companyName) {
        redirect('/onboarding?error=Company name is required')
    }

    // 1. Create Company
    const companyId = crypto.randomUUID()
    const { error: companyError } = await supabase
        .from('companies')
        .insert({ id: companyId, name: companyName })

    if (companyError) {
        // Attempting to bypass RLS initially could be tricky if we don't have service role,
        // but the policy allows INSERT to authenticated.
        console.error('Company creation error:', companyError)
        redirect(`/onboarding?error=${encodeURIComponent('Failed to create company')}`)
    }

    // 2. Create Company Member (Owner)
    const { error: memberError } = await supabase
        .from('company_members')
        .insert({
            company_id: companyId,
            user_id: user.id,
            role: 'owner',
        })

    if (memberError) {
        require('fs').appendFileSync('workspace_error.log', JSON.stringify({ step: 'member', error: memberError, user: user.id, company: companyId }) + '\n')
        console.error('Company member error:', memberError)
        redirect(`/onboarding?error=${encodeURIComponent('Failed to setup workspace access')}`)
    }

    // 3. Create Default Pipeline Stages
    const defaultStages = [
        { company_id: companyId, name: 'Lead', order: 1, color: '#e2e8f0' },
        { company_id: companyId, name: 'Contacted', order: 2, color: '#fef08a' },
        { company_id: companyId, name: 'Qualified', order: 3, color: '#bfdbfe' },
        { company_id: companyId, name: 'Proposal', order: 4, color: '#fbcfe8' },
        { company_id: companyId, name: 'Won', order: 5, color: '#bbf7d0' },
    ]

    const { error: stagesError } = await supabase.from('pipeline_stages').insert(defaultStages)

    if (stagesError) {
        console.error('Pipeline stages error:', stagesError)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

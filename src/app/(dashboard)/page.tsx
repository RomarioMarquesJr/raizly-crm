import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanContainer } from '@/components/crm/KanbanContainer'
import { LeadPanel } from '@/components/crm/LeadPanel'
import { CreateLeadModal } from '@/components/crm/CreateLeadModal'

export default async function CRMPage(props: { searchParams: Promise<{ leadId?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch initial data for the user
    const { data: memberData, error } = await (supabase as any)
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (error || !memberData) {
        redirect('/onboarding')
    }

    const [stagesRes, leadsRes] = await Promise.all([
        (supabase as any).from('pipeline_stages').select('*').eq('company_id', memberData.company_id).order('order', { ascending: true }),
        (supabase as any).from('leads').select('*').eq('company_id', memberData.company_id).order('created_at', { ascending: false }),
    ])

    return (
        <div className="flex h-full w-full">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
                    <CreateLeadModal />
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <KanbanContainer
                        initialStages={stagesRes.data || []}
                        initialLeads={leadsRes.data || []}
                    />
                </div>
            </div>
            {searchParams?.leadId && (
                <LeadPanel leadId={searchParams.leadId} />
            )}
        </div>
    )
}

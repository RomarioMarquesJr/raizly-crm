import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanContainer } from '@/components/crm/KanbanContainer'
import { CreateLeadModal } from '@/components/crm/CreateLeadModal'

export default async function CRMPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: memberData, error } = await (supabase as any)
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (error || !memberData) {
        redirect('/onboarding')
    }

    const companyId = memberData.company_id

    const [stagesRes, leadsRes] = await Promise.all([
        (supabase as any).from('pipeline_stages').select('*').eq('company_id', companyId).order('order', { ascending: true }),
        (supabase as any).from('leads').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
    ])

    return (
        <div className="flex h-full w-full flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus leads e oportunidades</p>
                </div>
                <CreateLeadModal />
            </div>
            <div className="flex-1 overflow-auto">
                <KanbanContainer
                    initialStages={stagesRes.data || []}
                    initialLeads={leadsRes.data || []}
                    companyId={companyId}
                />
            </div>
        </div>
    )
}

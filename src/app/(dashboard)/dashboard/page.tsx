import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LayoutDashboard, Target, Activity, DollarSign, Bell } from 'lucide-react'
import { PipelineFunnelChart } from '@/components/crm/dashboard/PipelineFunnelChart'
import { LeadsEvolutionChart } from '@/components/crm/dashboard/LeadsEvolutionChart'
import { PipelineValueChart } from '@/components/crm/dashboard/PipelineValueChart'
import { LeadDistributionChart } from '@/components/crm/dashboard/LeadDistributionChart'
import { LeadsFollowUpChart } from '@/components/crm/dashboard/LeadsFollowUpChart'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: memberData, error } = await (supabase as any)
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

    if (error || !memberData) redirect('/onboarding')

    const [leadsRes, remindersRes, stagesRes] = await Promise.all([
        (supabase as any).from('leads').select('*').eq('company_id', memberData.company_id),
        (supabase as any)
            .from('reminders')
            .select('*')
            .eq('company_id', memberData.company_id)
            .eq('is_completed', false),
        (supabase as any)
            .from('pipeline_stages')
            .select('*')
            .eq('company_id', memberData.company_id)
            .order('order', { ascending: true }),
    ])

    const leads = leadsRes.data || []
    const reminders = remindersRes.data || []
    const stages = stagesRes.data || []

    // ----- KPI CALCULATIONS -----
    const totalLeads = leads.length
    const totalValue = leads.filter((l: any) => l.status === 'open').reduce((acc: number, lead: any) => acc + (lead.value || 0), 0)
    const wonLeads = leads.filter((l: any) => l.status === 'won').length
    // Conversion Rule: (leads ganhos / total de leads criados) * 100
    // Only return 0 if totalLeads is > 0 and wonLeads is 0. Otherwise 0.
    const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0
    const openReminders = reminders.length

    // ----- CHART DATA TRANSFORMATION -----

    // 1. Funnel Data
    const funnelData = stages.map((stage: any) => ({
        stage: stage.name,
        count: leads.filter((l: any) => l.stage_id === stage.id).length,
        color: stage.color || 'var(--color-primary, #0f172a)'
    }))

    // 2. Leads Evolution Data (Grouped by created_at Date)
    const evolutionMap = new Map<string, number>()
    leads.forEach((l: any) => {
        const date = new Date(l.created_at).toISOString().split('T')[0]
        evolutionMap.set(date, (evolutionMap.get(date) || 0) + 1)
    })
    const evolutionData = Array.from(evolutionMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

    // 3. Pipeline Value Data (Open leads only)
    const valueMap = new Map<string, { value: number, count: number }>()
    const openLeads = leads.filter((l: any) => l.status === 'open')
    openLeads.forEach((l: any) => {
        const date = new Date(l.created_at).toISOString().split('T')[0]
        const current = valueMap.get(date) || { value: 0, count: 0 }
        valueMap.set(date, {
            value: current.value + (l.value || 0),
            count: current.count + 1
        })
    })
    const valueData = Array.from(valueMap.entries())
        .map(([date, data]) => ({ date, value: data.value, count: data.count }))
        .sort((a, b) => a.date.localeCompare(b.date))

    // 4. Lead Distribution Data (By Stage)
    const distributionData = stages.map((stage: any) => ({
        name: stage.name,
        value: leads.filter((l: any) => l.stage_id === stage.id).length,
        color: stage.color || '#334155'
    })).filter((d: { value: number }) => d.value > 0)

    // 5. Leads Follow-up Status (Only for open leads)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    let onTime = 0
    let delayed = 0
    let noAction = 0

    openLeads.forEach((l: any) => {
        const leadReminders = reminders.filter((r: any) => r.lead_id === l.id)
        if (leadReminders.length === 0) {
            noAction++
        } else {
            const hasDelayed = leadReminders.some((r: any) => new Date(r.due_date) < now)
            if (hasDelayed) delayed++
            else onTime++
        }
    })

    const followUpData = [
        { status: 'Em dia', count: onTime, fill: '#10b981' },
        { status: 'Atrasados (Aja agora)', count: delayed, fill: '#ef4444' },
        { status: 'Sem próximo passo', count: noAction, fill: '#f59e0b' }
    ]

    // 6. Calculate previous period value (simplified mock for now: assume last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const previousPeriodOpenLeads = openLeads.filter((l: any) => {
        const d = new Date(l.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })
    const previousPeriodValue = previousPeriodOpenLeads.reduce((acc: number, l: any) => acc + (l.value || 0), 0)

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Painel de Controle</h2>
                <p className="text-muted-foreground">Visão rápida da saúde comercial da sua empresa e onde focar agora.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLeads}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Valor da Pipeline</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${totalValue.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Leads Ganhos</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{wonLeads}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{winRate}%</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Ações Pendentes</CardTitle>
                        <Bell className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openReminders}</div>
                        <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
                    </CardContent>
                </Card>
            </div>

            {/* ACTION Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="col-span-1 md:col-span-3 lg:col-span-2">
                    <LeadsFollowUpChart data={followUpData} />
                </div>
                <div className="col-span-1">
                    <LeadDistributionChart data={distributionData} />
                </div>
            </div>

            {/* TREND & DISTRIBUTION Row */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <PipelineValueChart data={valueData} previousPeriodValue={previousPeriodValue} />
                <PipelineFunnelChart data={funnelData} />
            </div>
        </div>
    )
}

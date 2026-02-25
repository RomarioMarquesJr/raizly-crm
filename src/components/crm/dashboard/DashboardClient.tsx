'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchDashboardDataAction, fetchPipelineStagesAction } from '@/app/(dashboard)/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Target, DollarSign, Bell, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react'
import { PipelineFunnelChart } from './PipelineFunnelChart'
import { LeadsEvolutionChart } from './LeadsEvolutionChart'
import { PipelineValueChart } from './PipelineValueChart'
import { LeadDistributionChart } from './LeadDistributionChart'
import { LeadsFollowUpChart } from './LeadsFollowUpChart'

export function DashboardClient({ companyId }: { companyId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard', companyId],
        queryFn: () => fetchDashboardDataAction(companyId),
        staleTime: 30_000,
        refetchOnWindowFocus: true,
    })

    const { data: stages = [] } = useQuery({
        queryKey: ['pipelineStages', companyId],
        queryFn: () => fetchPipelineStagesAction(companyId),
        staleTime: 60_000,
    })

    if (isLoading || !data) {
        return (
            <div className="p-8 space-y-8">
                <div>
                    <div className="h-8 w-64 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-96 bg-muted rounded animate-pulse" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
                                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {[1, 2].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="h-[300px] bg-muted rounded-xl animate-pulse" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const { leads, reminders } = data

    // ----- KPI CALCULATIONS -----
    const totalLeads = leads.length

    // Use is_closed_won from stages to determine WON leads
    const wonStageIds = new Set(
        stages.filter((s: any) => s.is_closed_won).map((s: any) => s.id)
    )
    const wonLeads = leads.filter((l: any) => l.status === 'won' || wonStageIds.has(l.stage_id)).length

    // Pipeline value: only open leads (not won and not lost)
    const openLeads = leads.filter((l: any) => l.status === 'open' || (!wonStageIds.has(l.stage_id) && l.status !== 'lost'))
    const totalValue = openLeads.reduce((acc: number, l: any) => acc + (l.value || 0), 0)

    // Conversion rate
    const winRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0
    const openReminders = reminders.length

    // ----- CHART DATA -----

    // Funnel
    const funnelData = stages.map((stage: any) => ({
        stage: stage.name,
        count: leads.filter((l: any) => l.stage_id === stage.id).length,
        color: stage.color || '#94a3b8',
    }))

    // Evolution
    const evolutionMap = new Map<string, number>()
    leads.forEach((l: any) => {
        const date = new Date(l.created_at).toISOString().split('T')[0]
        evolutionMap.set(date, (evolutionMap.get(date) || 0) + 1)
    })
    const evolutionData = Array.from(evolutionMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

    // Pipeline Value
    const valueMap = new Map<string, { value: number; count: number }>()
    openLeads.forEach((l: any) => {
        const date = new Date(l.created_at).toISOString().split('T')[0]
        const current = valueMap.get(date) || { value: 0, count: 0 }
        valueMap.set(date, {
            value: current.value + (l.value || 0),
            count: current.count + 1,
        })
    })
    const valueData = Array.from(valueMap.entries())
        .map(([date, data]) => ({ date, value: data.value, count: data.count }))
        .sort((a, b) => a.date.localeCompare(b.date))

    // Distribution
    const distributionData = stages
        .map((stage: any) => ({
            name: stage.name,
            value: leads.filter((l: any) => l.stage_id === stage.id).length,
            color: stage.color || '#94a3b8',
        }))
        .filter((d: any) => d.value > 0)

    // Follow-up
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    let onTime = 0, delayed = 0, noAction = 0
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
        { status: 'Atrasados', count: delayed, fill: '#ef4444' },
        { status: 'Sem próximo passo', count: noAction, fill: '#f59e0b' },
    ]

    // Previous period value
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const prevOpenLeads = openLeads.filter((l: any) => {
        const d = new Date(l.created_at)
        return d >= sixtyDaysAgo && d < thirtyDaysAgo
    })
    const previousPeriodValue = prevOpenLeads.reduce((acc: number, l: any) => acc + (l.value || 0), 0)

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Painel de Controle</h2>
                <p className="text-muted-foreground mt-1">
                    Visão rápida da saúde comercial da sua empresa e onde focar agora.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                <KPICard title="Total de Leads" value={totalLeads.toString()} icon={<Activity className="h-4 w-4" />} />
                <KPICard
                    title="Valor da Pipeline"
                    value={formatCurrency(totalValue)}
                    icon={<DollarSign className="h-4 w-4" />}
                    valueClassName="text-emerald-600"
                />
                <KPICard
                    title="Leads Ganhos"
                    value={wonLeads.toString()}
                    icon={<Target className="h-4 w-4" />}
                    subtitle={wonLeads > 0 ? 'Parabéns! 🎯' : undefined}
                />
                <KPICard
                    title="Taxa de Conversão"
                    value={`${winRate}%`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    valueClassName={winRate > 0 ? 'text-emerald-600' : undefined}
                />
                <KPICard
                    title="Ações Pendentes"
                    value={openReminders.toString()}
                    icon={<Bell className="h-4 w-4 text-amber-500" />}
                    subtitle={delayed > 0 ? `${delayed} atrasada(s)` : 'Tudo em dia'}
                    subtitleClassName={delayed > 0 ? 'text-red-500' : 'text-emerald-500'}
                />
            </div>

            {/* Action Row (most important — shows where to act) */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="col-span-1 md:col-span-2">
                    <LeadsFollowUpChart data={followUpData} />
                </div>
                <div className="col-span-1">
                    <LeadDistributionChart data={distributionData} />
                </div>
            </div>

            {/* Trend & Distribution */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <PipelineValueChart data={valueData} previousPeriodValue={previousPeriodValue} />
                <PipelineFunnelChart data={funnelData} />
            </div>
        </div>
    )
}

// KPI Card mini-component
function KPICard({
    title,
    value,
    icon,
    subtitle,
    valueClassName,
    subtitleClassName,
}: {
    title: string
    value: string
    icon: React.ReactNode
    subtitle?: string
    valueClassName?: string
    subtitleClassName?: string
}) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${valueClassName || ''}`}>{value}</div>
                {subtitle && (
                    <p className={`text-xs mt-1 ${subtitleClassName || 'text-muted-foreground'}`}>{subtitle}</p>
                )}
            </CardContent>
        </Card>
    )
}

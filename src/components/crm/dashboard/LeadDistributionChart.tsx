'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface LeadDistributionChartProps {
    data: {
        name: string
        value: number
        color?: string
    }[]
}

const DEFAULT_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8']

export function LeadDistributionChart({ data }: LeadDistributionChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Distribuição de Leads</CardTitle>
                    <CardDescription>Percentual por etapa da pipeline</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Sem dados suficientes
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Distribuição de Leads</CardTitle>
                <CardDescription>Percentual por etapa da pipeline</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#0f172a' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

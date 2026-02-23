'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface LeadsFollowUpChartProps {
    data: {
        status: string
        count: number
        fill: string
    }[]
}

export function LeadsFollowUpChart({ data }: LeadsFollowUpChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Follow-up de Leads</CardTitle>
                    <CardDescription>Status das ações de acompanhamento</CardDescription>
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
                <CardTitle>Follow-up de Leads</CardTitle>
                <CardDescription>Status das ações de acompanhamento</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="status"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

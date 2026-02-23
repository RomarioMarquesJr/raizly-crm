'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface LeadsEvolutionChartProps {
    data: {
        date: string
        count: number
    }[]
}

export function LeadsEvolutionChart({ data }: LeadsEvolutionChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Evolução de Leads</CardTitle>
                    <CardDescription>Novos leads no período</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Sem dados suficientes
                </CardContent>
            </Card>
        )
    }

    const formattedData = data.map(item => ({
        ...item,
        label: format(parseISO(item.date), 'dd/MM', { locale: ptBR })
    }))

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Evolução de Leads</CardTitle>
                <CardDescription>Novos leads no período</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="var(--color-primary, #0f172a)"
                                strokeWidth={2}
                                dot={{ r: 4, fill: 'var(--color-primary, #0f172a)' }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

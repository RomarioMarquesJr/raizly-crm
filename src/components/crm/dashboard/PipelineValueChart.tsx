'use client'

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PipelineValueChartProps {
    data: {
        date: string
        value: number
        count: number // Added count here
    }[]
    previousPeriodValue?: number
}

export function PipelineValueChart({ data, previousPeriodValue }: PipelineValueChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Valor da Pipeline</CardTitle>
                    <CardDescription>Evolução do valor estimado (leads abertos)</CardDescription>
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
    }

    const totalCurrentValue = data.reduce((acc, curr) => acc + curr.value, 0)

    let variation = 0
    let isPositive = true
    if (previousPeriodValue && previousPeriodValue > 0) {
        variation = ((totalCurrentValue - previousPeriodValue) / previousPeriodValue) * 100
        isPositive = variation >= 0
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle>Valor da Pipeline</CardTitle>
                    <CardDescription>Evolução do valor estimado (leads abertos)</CardDescription>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalCurrentValue)}
                    </div>
                    {previousPeriodValue !== undefined && (
                        <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} font-medium`}>
                            {isPositive ? '+' : ''}{variation.toFixed(1)}% em relação ao período anterior
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary, #0f172a)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary, #0f172a)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(value) => `R$ ${value / 1000}k`}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white border rounded-lg shadow-md p-3">
                                                <p className="font-semibold text-sm mb-1">{label}</p>
                                                <p className="text-sm text-green-600 font-medium">
                                                    Valor: {formatCurrency(payload[0].value as number)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {payload[0].payload.count} leads abertos
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--color-primary, #0f172a)"
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

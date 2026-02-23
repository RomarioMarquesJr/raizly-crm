'use client'

import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface PipelineFunnelChartProps {
    data: {
        stage: string
        count: number
        color: string
    }[]
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Funil de Vendas</CardTitle>
                    <CardDescription>Quantidade de leads por etapa</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Sem dados suficientes
                </CardContent>
            </Card>
        )
    }

    // Calculate conversion rates and find biggest drop-off
    const enrichedData = useMemo(() => {
        let maxIdx = -1
        let maxDrop = 0

        const withRates = data.map((item, index) => {
            let conversionRate = 100
            let dropOff = 0

            if (index > 0 && data[index - 1].count > 0) {
                conversionRate = (item.count / data[index - 1].count) * 100
                dropOff = data[index - 1].count - item.count

                if (dropOff > maxDrop) {
                    maxDrop = dropOff
                    maxIdx = index
                }
            }

            return {
                ...item,
                conversionRate: index === 0 ? null : conversionRate.toFixed(1),
                dropOffCount: dropOff
            }
        })

        return withRates.map((item, index) => ({
            ...item,
            isBiggestDrop: index === maxIdx && item.dropOffCount > 0,
            maxDropOffValueLocal: maxDrop,
            maxDropOffIndexLocal: maxIdx
        }))
    }, [data])

    const maxDropOffValue = enrichedData[0]?.maxDropOffValueLocal || 0
    const maxDropOffIndex = enrichedData[0]?.maxDropOffIndexLocal || -1

    const dropOffMessage = maxDropOffIndex > 0
        ? `Atenção: A maior perda ocorre de "${data[maxDropOffIndex - 1].stage}" para "${data[maxDropOffIndex].stage}" (${maxDropOffValue} leads)`
        : "O funil está saudável ou sem dados suficientes para análise de perdas."

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Onde você está perdendo oportunidades</CardTitle>
                <CardDescription>Conversão entre etapas e gargalos do funil</CardDescription>
            </CardHeader>
            <CardContent>
                <p className={`text-xs font-medium mb-4 ${maxDropOffIndex > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {dropOffMessage}
                </p>
                <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrichedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="stage" type="category" width={100} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload
                                        return (
                                            <div className="bg-white border rounded-lg shadow-md p-3">
                                                <p className="font-semibold text-sm mb-1">{label}</p>
                                                <p className="text-sm font-medium">
                                                    {point.count} leads
                                                </p>
                                                {point.conversionRate !== null && (
                                                    <p className="text-xs text-muted-foreground mt-1 cursor-default">
                                                        Conversão da etapa anterior: <span className="font-bold">{point.conversionRate}%</span>
                                                    </p>
                                                )}
                                                {point.isBiggestDrop && (
                                                    <p className="text-xs text-red-500 font-medium mt-1">
                                                        Queda: -{point.dropOffCount} leads
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                {
                                    enrichedData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isBiggestDrop ? '#ef4444' : entry.color}
                                        />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

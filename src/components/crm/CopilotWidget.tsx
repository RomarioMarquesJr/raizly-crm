'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function CopilotWidget({
    leadId,
    companyId,
    leadDetails,
    timelineEvents,
}: {
    leadId: string
    companyId: string
    leadDetails: any
    timelineEvents: any[]
}) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<any>(null)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ai/copilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId, companyId, leadDetails, timelineEvents }),
            })
            const result = await res.json()

            if (!res.ok) throw new Error(result.error || 'Falha ao gerar insights')

            setData(result.data)
            if (result.cached) {
                toast.info('Carregado do cache da IA', { duration: 2000 })
            } else {
                toast.success('Novos insights de IA gerados')
            }
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-sm">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    Copiloto IA
                </CardTitle>
                <CardDescription className="text-xs">
                    Insights inteligentes e próximas ações.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!data && !loading && (
                    <Button variant="outline" size="sm" className="w-full text-primary border-primary/20" onClick={handleGenerate}>
                        Gerar Insights
                    </Button>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                )}

                {data && (
                    <div className="space-y-3 text-sm">
                        <div>
                            <span className="font-semibold block text-primary">Resumo</span>
                            <p className="text-muted-foreground">{data.summary}</p>
                        </div>
                        <div>
                            <span className="font-semibold block text-primary">Próxima Ação</span>
                            <p className="text-muted-foreground">{data.next_action}</p>
                        </div>
                        <div>
                            <span className="font-semibold block text-primary">Rascunho de E-mail</span>
                            <div className="bg-background border rounded-md p-2 mt-1 text-xs font-mono whitespace-pre-wrap">
                                {data.follow_up_email}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

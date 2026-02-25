'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Copy, RefreshCw, AlertCircle, FileText, Zap, Mail } from 'lucide-react'
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
    const [error, setError] = useState<string | null>(null)

    // CRITICAL: Reset state when leadId changes (fixes stale insights bug)
    useEffect(() => {
        setData(null)
        setError(null)
        setLoading(false)
    }, [leadId])

    const handleGenerate = useCallback(async () => {
        setLoading(true)
        setError(null)
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
                toast.info('Carregado do cache', { duration: 2000 })
            } else {
                toast.success('Insights gerados com sucesso!')
            }
        } catch (err: any) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }, [leadId, companyId, leadDetails, timelineEvents])

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copiado!`, { duration: 1500 })
    }

    // Empty State
    if (!data && !loading && !error) {
        return (
            <Card className="border-dashed border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
                <CardContent className="flex flex-col items-center text-center py-8 px-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-3">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-sm font-medium mb-1">Copiloto IA</p>
                    <p className="text-xs text-muted-foreground mb-4">
                        Gere um resumo inteligente, próxima ação e rascunho de e-mail.
                    </p>
                    <Button
                        size="sm"
                        onClick={handleGenerate}
                        className="gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Gerar Insights
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Loading State — skeletons
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/40">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                                <div className="h-3 w-4/5 bg-muted rounded animate-pulse" />
                                {i === 3 && <div className="h-3 w-3/5 bg-muted rounded animate-pulse" />}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analisando dados do lead...
                </div>
            </div>
        )
    }

    // Error State
    if (error) {
        return (
            <Card className="border-red-200/60 bg-red-50/50">
                <CardContent className="flex flex-col items-center text-center py-6 px-4">
                    <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
                    <p className="text-sm font-medium text-red-600 mb-1">Falha ao gerar insights</p>
                    <p className="text-xs text-red-500/80 mb-4">{error}</p>
                    <Button size="sm" variant="outline" onClick={handleGenerate} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
                        <RefreshCw className="h-3.5 w-3.5" />
                        Tentar novamente
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Data State — 3 premium cards
    return (
        <div className="space-y-3">
            {/* Summary Card */}
            <Card className="border-border/40 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">Resumo</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(data.summary, 'Resumo')}
                            title="Copiar resumo"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
                </CardContent>
            </Card>

            {/* Next Action Card */}
            <Card className="border-emerald-200/50 bg-emerald-50/30 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Próxima Ação</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(data.next_action, 'Próxima ação')}
                            title="Copiar ação"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <p className="text-sm text-emerald-700 font-medium leading-relaxed">{data.next_action}</p>
                </CardContent>
            </Card>

            {/* Email Draft Card */}
            <Card className="border-border/40 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-violet-500" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Rascunho de E-mail</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleCopy(data.follow_up_email, 'E-mail')}
                            title="Copiar e-mail"
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="bg-background border rounded-lg p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {data.follow_up_email}
                    </div>
                </CardContent>
            </Card>

            {/* Refresh button */}
            <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                onClick={handleGenerate}
                disabled={loading}
            >
                <RefreshCw className="h-3.5 w-3.5" />
                Atualizar Insights
            </Button>
        </div>
    )
}

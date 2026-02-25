'use client'

import { useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchLeadDetailsAction } from '@/app/(dashboard)/actions'
import { X, Sparkles, Mail, Phone, DollarSign, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ReminderManager } from './ReminderManager'
import { CopilotWidget } from './CopilotWidget'

interface LeadPanelWrapperProps {
    leadId: string
    onClose: () => void
}

export function LeadPanelWrapper({ leadId, onClose }: LeadPanelWrapperProps) {
    // Fetch lead details via TanStack Query — keyed by leadId for proper cache isolation per lead
    const { data, isLoading, error } = useQuery({
        queryKey: ['leadDetails', leadId],
        queryFn: () => fetchLeadDetailsAction(leadId),
        enabled: !!leadId,
        staleTime: 30_000,
    })

    // ESC key handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
    }, [onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])


    if (isLoading) {
        return (
            <>
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
                    onClick={onClose}
                />
                {/* Panel skeleton */}
                <aside className="fixed right-0 top-0 bottom-0 w-[440px] max-w-full bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between p-5 border-b">
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex-1 p-5 space-y-4">
                        <div className="h-4 w-full bg-muted rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-32 w-full bg-muted rounded-xl animate-pulse" />
                        <div className="h-24 w-full bg-muted rounded-xl animate-pulse" />
                    </div>
                </aside>
            </>
        )
    }

    if (error || !data?.lead) {
        return (
            <>
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
                    onClick={onClose}
                />
                <aside className="fixed right-0 top-0 bottom-0 w-[440px] max-w-full bg-background border-l shadow-2xl z-50 flex flex-col items-center justify-center animate-in slide-in-from-right duration-300">
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                    <p className="text-muted-foreground">Lead não encontrado.</p>
                </aside>
            </>
        )
    }

    const lead = data.lead
    const timeline = data.timeline
    const reminders = data.reminders

    return (
        <>
            {/* Overlay — click to close */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Side Panel */}
            <aside className="fixed right-0 top-0 bottom-0 w-[440px] max-w-full bg-background border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
                {/* Fixed Header */}
                <div className="shrink-0 p-5 border-b bg-gradient-to-r from-background to-muted/30">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-bold truncate">{lead.name}</h2>
                            {lead.company_name && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                                    {lead.company_name}
                                </p>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 -mt-1 -mr-1 hover:bg-destructive/10 hover:text-destructive" onClick={onClose} title="Fechar (ESC)">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Lead Info Summary */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-1 p-2.5 bg-background rounded-xl border text-center">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">Valor</span>
                            <span className="text-sm font-bold text-emerald-600">${lead.value?.toLocaleString('en-US') || 0}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2.5 bg-background rounded-xl border text-center">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-muted-foreground">E-mail</span>
                            <span className="text-xs font-medium truncate w-full" title={lead.email || '-'}>{lead.email || '-'}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2.5 bg-background rounded-xl border text-center">
                            <Phone className="h-4 w-4 text-violet-500" />
                            <span className="text-xs text-muted-foreground">Telefone</span>
                            <span className="text-xs font-medium truncate w-full">{lead.phone || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-6">
                        {/* Copilot AI Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Copiloto IA</h3>
                            </div>
                            <CopilotWidget
                                leadId={leadId}
                                companyId={lead.company_id}
                                leadDetails={lead}
                                timelineEvents={timeline}
                            />
                        </div>

                        <Separator />

                        {/* Reminders Section */}
                        <ReminderManager leadId={leadId} companyId={lead.company_id} />

                        <Separator />

                        {/* Timeline Section */}
                        <div>
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Linha do Tempo</h3>
                            <div className="space-y-4">
                                {timeline.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-muted-foreground italic">Nenhuma atividade ainda.</p>
                                    </div>
                                ) : (
                                    timeline.map((event: any) => (
                                        <div key={event.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 ring-4 ring-primary/10" />
                                                <div className="w-px h-full bg-border flex-1 mt-2" />
                                            </div>
                                            <div className="pb-4">
                                                <p className="text-sm font-medium">
                                                    {event.type === 'stage_change' ? 'Fase Alterada' : 'Nota Adicionada'}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-0.5">{event.content}</p>
                                                <span className="text-xs text-muted-foreground/60 mt-1 block">
                                                    {new Date(event.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

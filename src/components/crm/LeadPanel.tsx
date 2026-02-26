import { createClient } from '@/utils/supabase/server'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ReminderManager } from './ReminderManager'
import { CopilotWidget } from './CopilotWidget'

export async function LeadPanel({ leadId }: { leadId: string }) {
    const supabase = await createClient()

    // Fetch lead details and timeline
    const [leadRes, timelineRes, remindersRes] = await Promise.all([
        (supabase as any).from('leads').select('*').eq('id', leadId).single(),
        (supabase as any).from('lead_timeline_events').select('*').eq('lead_id', leadId).order('created_at', { ascending: false }),
        (supabase as any).from('reminders').select('*').eq('lead_id', leadId).eq('is_completed', false).order('due_date', { ascending: true }),
    ])

    const lead = leadRes.data
    const timeline = timelineRes.data || []
    const reminders = remindersRes.data || []

    if (!lead) {
        return (
            <div className="flex h-full items-center justify-center p-4">
                <p className="text-muted-foreground">Lead não encontrado.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background border-l w-[400px]">
            <div className="p-4 border-b bg-muted/20">
                <h2 className="text-xl font-bold">{lead.name}</h2>
                {lead.company_name && <p className="text-sm text-muted-foreground">{lead.company_name}</p>}
                <div className="mt-4 flex flex-col gap-1 text-sm bg-background p-3 rounded-md border">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor</span>
                        <span className="font-semibold text-green-600">${lead.value?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">E-mail</span>
                        <span>{lead.email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefone</span>
                        <span>{lead.phone || '-'}</span>
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-8">
                    <CopilotWidget
                        leadId={leadId}
                        companyId={lead.company_id}
                        leadDetails={lead}
                        timelineEvents={timeline}
                    />

                    {/* Reminders Section */}
                    <ReminderManager reminders={reminders} leadId={leadId} companyId={lead.company_id} />

                    <Separator />

                    <div>
                        <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">Linha do Tempo de Atividades</h3>
                        <div className="space-y-4">
                            {timeline.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Nenhuma atividade ainda.</p>
                            ) : (
                                timeline.map((event: any) => (
                                    <div key={event.id} className="flex gap-3">
                                        <div className="flex flex-col items-center">
                                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
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
            </ScrollArea>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { createReminderAction, completeReminderAction } from '@/app/(dashboard)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Clock, Plus } from 'lucide-react'
import { toast } from 'sonner'

export function ReminderManager({
    reminders,
    leadId,
    companyId,
}: {
    reminders: any[]
    leadId: string
    companyId: string
}) {
    const [isAdding, setIsAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [dueDate, setDueDate] = useState('')

    const handleAdd = async () => {
        if (!title || !dueDate) return toast.error('Por favor, preencha o título e a data.')
        try {
            await createReminderAction(leadId, companyId, title, dueDate)
            toast.success('Lembrete adicionado')
            setTitle('')
            setDueDate('')
            setIsAdding(false)
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const handleComplete = async (id: string) => {
        try {
            await completeReminderAction(id)
            toast.success('Marcado como concluído')
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">Lembretes</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(!isAdding)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                </Button>
            </div>

            {isAdding && (
                <div className="mb-4 p-3 border rounded-md bg-muted/20 space-y-3">
                    <Input placeholder="Ligar para acompanhamento..." value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAdd}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {reminders.length === 0 && !isAdding ? (
                    <p className="text-sm text-muted-foreground italic">Nenhum lembrete em aberto.</p>
                ) : (
                    reminders.map((reminder) => (
                        <div key={reminder.id} className="flex flex-row items-center justify-between p-3 border rounded-md gap-3 bg-background group">
                            <div className="flex flex-col gap-1 flex-1">
                                <p className="font-medium text-sm">{reminder.title}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Vencimento: {new Date(reminder.due_date).toLocaleDateString()}
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleComplete(reminder.id)}
                            >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

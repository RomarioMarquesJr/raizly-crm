'use client'

import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createReminderAction, completeReminderAction, fetchRemindersAction } from '@/app/(dashboard)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, Clock, Plus, AlertTriangle, Bell } from 'lucide-react'
import { toast } from 'sonner'

export function ReminderManager({
    leadId,
    companyId,
}: {
    leadId: string
    companyId: string
}) {
    const queryClient = useQueryClient()
    const [isAdding, setIsAdding] = useState(false)
    const [title, setTitle] = useState('')
    const [dueDate, setDueDate] = useState('')
    const listEndRef = useRef<HTMLDivElement>(null)

    // TanStack Query for reminders
    const { data: reminders = [], isLoading } = useQuery({
        queryKey: ['reminders', leadId],
        queryFn: () => fetchRemindersAction(leadId),
        staleTime: 15_000,
    })

    // Create mutation
    const createMutation = useMutation({
        mutationFn: () => createReminderAction(leadId, companyId, title, dueDate),
        onSuccess: () => {
            toast.success('Lembrete adicionado!')
            setTitle('')
            setDueDate('')
            setIsAdding(false)
            queryClient.invalidateQueries({ queryKey: ['reminders', leadId] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
            // Scroll to bottom after re-render
            setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
        },
        onError: (err: any) => toast.error(err.message),
    })

    // Complete mutation
    const completeMutation = useMutation({
        mutationFn: (reminderId: string) => completeReminderAction(reminderId),
        onMutate: async (reminderId) => {
            await queryClient.cancelQueries({ queryKey: ['reminders', leadId] })
            const prev = queryClient.getQueryData<any[]>(['reminders', leadId])
            queryClient.setQueryData(['reminders', leadId], (old: any[]) =>
                old?.filter((r) => r.id !== reminderId)
            )
            return { prev }
        },
        onError: (err: any, _id, context) => {
            if (context?.prev) queryClient.setQueryData(['reminders', leadId], context.prev)
            toast.error(err.message)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders', leadId] })
            queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        },
        onSuccess: () => toast.success('Concluído!'),
    })

    const handleAdd = () => {
        if (!title || !dueDate) return toast.error('Preencha o título e a data.')
        createMutation.mutate()
    }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Lembretes</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 hover:bg-primary/10 hover:text-primary"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar
                </Button>
            </div>

            {isAdding && (
                <div className="mb-4 p-3.5 border rounded-xl bg-muted/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Input
                        placeholder="Ex: Ligar para acompanhamento..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-lg"
                    />
                    <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="rounded-lg"
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAdd} disabled={createMutation.isPending} className="rounded-lg">
                            {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-lg">
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : reminders.length === 0 && !isAdding ? (
                <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                    <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum lembrete em aberto.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Adicionar" para criar.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {reminders.map((reminder: any) => {
                        const isOverdue = new Date(reminder.due_date) < now
                        return (
                            <div
                                key={reminder.id}
                                className={`flex flex-row items-center justify-between p-3 border rounded-xl gap-3 bg-background group transition-all hover:shadow-sm ${isOverdue ? 'border-red-200 bg-red-50/50' : ''
                                    }`}
                            >
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{reminder.title}</p>
                                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                                        {isOverdue ? (
                                            <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                                        ) : (
                                            <Clock className="w-3 h-3 shrink-0" />
                                        )}
                                        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                                            {isOverdue ? 'Atrasado — ' : ''}
                                            {new Date(reminder.due_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-emerald-50 hover:text-emerald-600"
                                    onClick={() => completeMutation.mutate(reminder.id)}
                                    disabled={completeMutation.isPending}
                                    title="Marcar como concluído"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </Button>
                            </div>
                        )
                    })}
                    <div ref={listEndRef} />
                </div>
            )}
        </div>
    )
}

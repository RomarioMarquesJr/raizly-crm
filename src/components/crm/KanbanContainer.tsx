'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KanbanBoard } from './KanbanBoard'
import { updateLeadStageAction, fetchLeadsAction } from '@/app/(dashboard)/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type Stage = {
    id: string
    name: string
    color: string | null
    order: number
}

type Lead = {
    id: string
    name: string
    company_name: string | null
    value: number
    stage_id: string
}

export function KanbanContainer({ initialStages, initialLeads }: { initialStages: Stage[], initialLeads: Lead[] }) {
    const queryClient = useQueryClient()
    const router = useRouter()

    const { data: leads } = useQuery({
        queryKey: ['leads'],
        queryFn: () => fetchLeadsAction(),
        initialData: initialLeads,
    })

    const { mutate } = useMutation({
        mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) =>
            updateLeadStageAction(leadId, stageId),
        onMutate: async ({ leadId, stageId }) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ['leads'] })

            // Snapshot previous value
            const previousLeads = queryClient.getQueryData<Lead[]>(['leads'])

            // Optimistically update
            if (previousLeads) {
                queryClient.setQueryData<Lead[]>(['leads'], (old) =>
                    old?.map((l) => (l.id === leadId ? { ...l, stage_id: stageId } : l))
                )
            }

            return { previousLeads }
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            if (context?.previousLeads) {
                queryClient.setQueryData(['leads'], context.previousLeads)
            }
            toast.error('Falha ao mover lead: ' + err.message)
        },
        onSettled: () => {
            // Refresh after mutate
            queryClient.invalidateQueries({ queryKey: ['leads'] })
        },
    })

    const handleLeadMove = (leadId: string, newStageId: string) => {
        mutate({ leadId, stageId: newStageId })
    }

    const handleLeadSelect = (leadId: string) => {
        router.push(`/?leadId=${leadId}`)
    }

    return (
        <KanbanBoard
            initialStages={initialStages}
            initialLeads={leads as Lead[]}
            onLeadMove={handleLeadMove}
            onLeadSelect={handleLeadSelect}
        />
    )
}

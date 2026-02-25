'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { KanbanBoard } from './KanbanBoard'
import { LeadPanelWrapper } from './LeadPanelWrapper'
import { updateLeadStageAction, fetchLeadsAction } from '@/app/(dashboard)/actions'
import { toast } from 'sonner'

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

export function KanbanContainer({ initialStages, initialLeads, companyId }: { initialStages: Stage[]; initialLeads: Lead[]; companyId: string }) {
    const queryClient = useQueryClient()
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

    const { data: leads } = useQuery({
        queryKey: ['leads', companyId],
        queryFn: () => fetchLeadsAction(companyId),
        initialData: initialLeads,
    })

    const { mutate } = useMutation({
        mutationFn: ({ leadId, stageId }: { leadId: string; stageId: string }) =>
            updateLeadStageAction(leadId, stageId),
        onMutate: async ({ leadId, stageId }) => {
            await queryClient.cancelQueries({ queryKey: ['leads', companyId] })
            const previousLeads = queryClient.getQueryData<Lead[]>(['leads', companyId])
            if (previousLeads) {
                queryClient.setQueryData<Lead[]>(['leads', companyId], (old) =>
                    old?.map((l) => (l.id === leadId ? { ...l, stage_id: stageId } : l))
                )
            }
            return { previousLeads }
        },
        onError: (err, _vars, context) => {
            if (context?.previousLeads) {
                queryClient.setQueryData(['leads', companyId], context.previousLeads)
            }
            toast.error('Falha ao mover lead: ' + err.message)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['leads', companyId] })
            queryClient.invalidateQueries({ queryKey: ['dashboard', companyId] })
            queryClient.invalidateQueries({ queryKey: ['pipelineStages', companyId] })
        },
    })

    const handleLeadMove = (leadId: string, newStageId: string) => {
        mutate({ leadId, stageId: newStageId })
    }

    const handleLeadSelect = (leadId: string) => {
        setSelectedLeadId(leadId)
    }

    const handleClosePanel = () => {
        setSelectedLeadId(null)
    }

    return (
        <>
            <KanbanBoard
                initialStages={initialStages}
                initialLeads={leads as Lead[]}
                onLeadMove={handleLeadMove}
                onLeadSelect={handleLeadSelect}
            />
            {selectedLeadId && (
                <LeadPanelWrapper
                    leadId={selectedLeadId}
                    onClose={handleClosePanel}
                />
            )}
        </>
    )
}

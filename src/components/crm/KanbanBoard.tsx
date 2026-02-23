'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Lead = {
    id: string
    name: string
    company_name: string | null
    value: number
    stage_id: string
}

type Stage = {
    id: string
    name: string
    color: string | null
    order: number
}

interface KanbanBoardProps {
    initialStages: Stage[]
    initialLeads: Lead[]
    onLeadSelect: (leadId: string) => void
    onLeadMove: (leadId: string, newStageId: string) => void
}

export function KanbanBoard({ initialStages, initialLeads, onLeadSelect, onLeadMove }: KanbanBoardProps) {
    const [stages] = useState(initialStages.sort((a, b) => a.order - b.order))

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result

        // dropped outside a valid droppable area
        if (!destination) return

        // dropped in the same place
        if (source.droppableId === destination.droppableId && source.index === destination.index) return

        // Notify parent to mutate and optimistically update
        onLeadMove(draggableId, destination.droppableId)
    }

    return (
        <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
            <DragDropContext onDragEnd={onDragEnd}>
                {stages.map((stage) => {
                    const stageLeads = initialLeads.filter((l) => l.stage_id === stage.id)

                    return (
                        <div key={stage.id} className="flex min-w-[300px] flex-col rounded-lg bg-muted/40 p-3">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color || '#ccc' }} />
                                    <h3 className="font-semibold">{stage.name}</h3>
                                </div>
                                <Badge variant="secondary">{stageLeads.length}</Badge>
                            </div>

                            <Droppable droppableId={stage.id}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 transition-colors rounded-md p-1 min-h-[100px] ${snapshot.isDraggingOver ? 'bg-muted/60' : ''
                                            }`}
                                    >
                                        {stageLeads.map((lead, index) => (
                                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`mb-2 cursor-pointer transition-shadow ${snapshot.isDragging ? 'opacity-90 shadow-lg' : ''
                                                            }`}
                                                        onClick={() => onLeadSelect(lead.id)}
                                                    >
                                                        <Card>
                                                            <CardContent className="p-3">
                                                                <div className="font-medium text-sm mb-1">{lead.name}</div>
                                                                {lead.company_name && (
                                                                    <div className="text-xs text-muted-foreground mb-2">
                                                                        {lead.company_name}
                                                                    </div>
                                                                )}
                                                                <div className="text-xs font-semibold text-green-600">
                                                                    ${lead.value.toLocaleString()}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </DragDropContext>
        </div>
    )
}

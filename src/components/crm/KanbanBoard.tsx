'use client'

import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sparkles } from 'lucide-react'

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
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return
        onLeadMove(draggableId, destination.droppableId)
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="flex h-full w-full gap-4 overflow-x-auto p-4">
                <DragDropContext onDragEnd={onDragEnd}>
                    {stages.map((stage) => {
                        const stageLeads = initialLeads.filter((l) => l.stage_id === stage.id)

                        return (
                            <div key={stage.id} className="flex min-w-[300px] flex-col rounded-2xl bg-muted/30 border border-border/50 p-3">
                                {/* Stage Header */}
                                <div className="mb-3 flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background"
                                            style={{
                                                backgroundColor: stage.color || '#94a3b8',
                                            }}
                                        />
                                        <h3 className="font-semibold text-sm">{stage.name}</h3>
                                    </div>
                                    <Badge variant="secondary" className="text-xs font-medium rounded-full px-2.5">
                                        {stageLeads.length}
                                    </Badge>
                                </div>

                                <Droppable droppableId={stage.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={`flex-1 transition-all rounded-xl p-1.5 min-h-[100px] ${snapshot.isDraggingOver
                                                ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed'
                                                : ''
                                                }`}
                                        >
                                            {stageLeads.map((lead, index) => (
                                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`mb-2 cursor-pointer transition-all duration-200 ${snapshot.isDragging
                                                                ? 'opacity-90 shadow-xl scale-[1.02] rotate-1'
                                                                : 'hover:shadow-md hover:-translate-y-0.5'
                                                                }`}
                                                            onClick={() => onLeadSelect(lead.id)}
                                                        >
                                                            <Card className="border border-border/60 shadow-sm rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-colors">
                                                                <CardContent className="p-3.5">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="min-w-0 flex-1">
                                                                            <div className="font-medium text-sm mb-1 truncate">{lead.name}</div>
                                                                            {lead.company_name && (
                                                                                <div className="text-xs text-muted-foreground mb-2 truncate">
                                                                                    {lead.company_name}
                                                                                </div>
                                                                            )}
                                                                            <div className="text-xs font-semibold text-emerald-600">
                                                                                ${lead.value.toLocaleString('en-US')}
                                                                            </div>
                                                                        </div>
                                                                        {/* AI Copilot Indicator */}
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-amber-600 cursor-default">
                                                                                    <Sparkles className="h-3 w-3" />
                                                                                    <span className="text-[10px] font-semibold leading-none">IA</span>
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="left" className="text-xs">
                                                                                Copiloto disponível — clique para insights
                                                                            </TooltipContent>
                                                                        </Tooltip>
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
        </TooltipProvider>
    )
}

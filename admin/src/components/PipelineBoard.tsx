"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@/lib/types";
import { PIPELINE_STAGES } from "@/lib/stages";
import { updateLeadStage } from "@/app/pipeline/actions";

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded border border-zinc-300 bg-white p-2 text-sm shadow-sm active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900"
    >
      <p className="font-medium">
        {lead.first_name} {lead.last_name}
      </p>
      <p className="text-zinc-500 dark:text-zinc-400">{lead.company_name}</p>
      {lead.pipeline_stage === "Closed" && lead.closed_amount != null && (
        <p className="text-green-600 dark:text-green-400">
          ${lead.closed_amount.toLocaleString()}
        </p>
      )}
    </div>
  );
}

function Column({
  stage,
  leads,
}: {
  stage: string;
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col gap-2 rounded border p-2 ${
        isOver
          ? "border-black bg-zinc-100 dark:border-white dark:bg-zinc-800"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <p className="px-1 text-sm font-semibold">
        {stage} <span className="text-zinc-400">({leads.length})</span>
      </p>
      <div className="flex flex-col gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

export default function PipelineBoard({
  initialLeads,
}: {
  initialLeads: Lead[];
}) {
  const [leads, setLeads] = useState(initialLeads);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const newStage = String(over.id);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.pipeline_stage === newStage) return;

    let closedAmount: number | undefined;
    if (newStage === "Closed") {
      const input = window.prompt("Deal amount ($)?");
      if (input === null) return;
      const parsed = Number(input);
      if (Number.isNaN(parsed)) return;
      closedAmount = parsed;
    }

    const previousLeads = leads;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              pipeline_stage: newStage,
              closed_amount: closedAmount ?? l.closed_amount,
            }
          : l
      )
    );

    updateLeadStage(leadId, newStage, closedAmount).catch((err) => {
      setLeads(previousLeads);
      window.alert(`Failed to update lead: ${err.message}`);
    });
  }

  return (
    <DndContext id="pipeline-board" sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <Column
            key={stage}
            stage={stage}
            leads={leads.filter((l) => l.pipeline_stage === stage)}
          />
        ))}
      </div>
    </DndContext>
  );
}

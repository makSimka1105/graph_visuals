"use client";

import { useAppSelector } from "@/store/hooks";
import type { AuxiliaryQueue, FloydMatrixData } from "@/types/graph";
import { QueueBlock } from "@/components/graph/QueueBlock";
import { StackBlock } from "@/components/graph/StackBlock";
import { DequeBlock } from "@/components/graph/DequeBlock";
import { PriorityQueueBlock } from "@/components/graph/PriorityQueueBlock";
import { FloydMatrixDisplay } from "@/components/graph/FloydMatrixDisplay";

type Source = "A" | "B";

interface ComparisonAuxiliaryDisplayProps {
  source: Source;
}

export function ComparisonAuxiliaryDisplay({ source }: ComparisonAuxiliaryDisplayProps) {
  const comp = useAppSelector((s) => s.comparison);
  const steps = source === "A" ? comp.stepsA : comp.stepsB;
  const { currentStepIndex } = comp;

  const totalSteps = steps.length;
  const displayStepIndex = totalSteps > 0 ? Math.min(Math.max(0, currentStepIndex), totalSteps - 1) : 0;
  const currentStep = steps.length > 0 ? steps[displayStepIndex] ?? null : null;

  const {
    queues,
    currentVertex,
    lastAddedToQueue,
    extractedInThisStep = false,
    currentVertexQueueIndex = 0,
    lastAddedToQueueIndex = 0,
    lastAddedToQueueSide = "right",
  } = currentStep?.auxiliary ?? {};

  const hasQueues = queues && queues.length > 0;
  const floydMatrix = currentStep?.data?.floydMatrix as FloydMatrixData | undefined;

  if (!hasQueues && !floydMatrix) return null;

  return (
    <div className="flex flex-col-reverse items-end gap-2 min-w-0 shrink max-w-[70%] overflow-hidden">
      {floydMatrix && <FloydMatrixDisplay data={floydMatrix} />}
      {hasQueues && (
      <div className="flex flex-col gap-3 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-4 py-3 max-w-[280px] min-w-0">
        {hasQueues &&
          queues!.map((q: AuxiliaryQueue, i: number) => {
            const isExtractStep = extractedInThisStep && currentVertexQueueIndex === i;
            const isLastAddTarget = lastAddedToQueue != null && lastAddedToQueueIndex === i;

            if (q.type === "queue") {
              return (
                <QueueBlock
                  key={i}
                  items={q.items}
                  label={q.label}
                  highlightDequeue={isExtractStep}
                  highlightEnqueue={isLastAddTarget}
                />
              );
            }
            if (q.type === "stack") {
              return (
                <StackBlock
                  key={i}
                  items={q.items}
                  label={q.label}
                  highlightTop={isExtractStep || isLastAddTarget}
                  extractFromTop={isExtractStep}
                />
              );
            }
            if (q.type === "deque") {
              return (
                <DequeBlock
                  key={i}
                  items={q.items}
                  label={q.label}
                  highlightExtract={isExtractStep}
                  highlightPushBack={isLastAddTarget && lastAddedToQueueSide === "right"}
                  highlightPushFront={isLastAddTarget && lastAddedToQueueSide === "left"}
                  itemsWithSource={q.itemsWithSource}
                />
              );
            }
            if (q.type === "priority" && q.itemsWithDist) {
              return (
                <PriorityQueueBlock
                  key={i}
                  items={q.itemsWithDist}
                  label={q.label}
                  highlightDequeue={isExtractStep}
                  highlightEnqueue={isLastAddTarget}
                />
              );
            }
            return null;
          })}
      </div>
      )}
      {currentVertex != null && (
      <div className="flex flex-col gap-1 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-3 py-2 shrink-0 min-w-[60px]">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Visiting</span>
        <span className="text-sm font-mono font-medium text-amber-400 min-h-[20px]">
          {currentVertex}
        </span>
      </div>
      )}
    </div>
  );
}

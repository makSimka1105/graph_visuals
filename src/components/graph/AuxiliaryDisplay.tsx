"use client";

import { useCurrentStep } from "@/store/hooks";
import type { AuxiliaryQueue } from "@/types/graph";
import { QueueBlock } from "./QueueBlock";
import { StackBlock } from "./StackBlock";
import { DequeBlock } from "./DequeBlock";
import { PriorityQueueBlock } from "./PriorityQueueBlock";
export function AuxiliaryDisplay() {
  const { currentStep } = useCurrentStep();
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

  if (!hasQueues) return null;

  return (
    <div className="auxiliary-display  flex items-end gap-1 shrink-1 ">
      <div className="flex flex-col gap-3 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-4 py-3 max-w-[280px]">
        {hasQueues && queues!.map((q: AuxiliaryQueue, i: number) => {
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
      <div className="hidden sm:flex flex-col gap-1 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-3 py-2 shrink-0 min-w-[60px]">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Visiting</span>
        <span className="text-sm font-mono font-medium text-amber-400 min-h-[20px]">
          {currentVertex ?? "-"}
        </span>
      </div>

    </div>
  );
}

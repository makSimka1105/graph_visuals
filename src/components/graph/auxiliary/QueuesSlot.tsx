"use client";

import type { AlgorithmStep, AuxiliaryQueue } from "@/types/graph";
import { QueueBlock } from "../QueueBlock";
import { StackBlock } from "../StackBlock";
import { DequeBlock } from "../DequeBlock";
import { PriorityQueueBlock } from "../PriorityQueueBlock";

export function hasQueuesData(step: AlgorithmStep | null): boolean {
  const queues = step?.auxiliary?.queues;
  return Boolean(queues && queues.length > 0);
}

function renderQueueBlock(
  q: AuxiliaryQueue,
  isExtractStep: boolean,
  isLastAddTarget: boolean,
  lastAddedToQueueSide: "left" | "right"
): React.ReactNode {
  switch (q.type) {
    case "queue":
      return (
        <QueueBlock
          items={q.items}
          label={q.label}
          highlightDequeue={isExtractStep}
          highlightEnqueue={isLastAddTarget}
        />
      );
    case "stack":
      return (
        <StackBlock
          items={q.items}
          label={q.label}
          highlightTop={isExtractStep || isLastAddTarget}
          extractFromTop={isExtractStep}
        />
      );
    case "deque":
      return (
        <DequeBlock
          items={q.items}
          label={q.label}
          highlightExtract={isExtractStep}
          highlightPushBack={isLastAddTarget && lastAddedToQueueSide === "right"}
          highlightPushFront={isLastAddTarget && lastAddedToQueueSide === "left"}
          itemsWithSource={q.itemsWithSource}
        />
      );
    case "priority":
      return q.itemsWithDist ? (
        <PriorityQueueBlock
          items={q.itemsWithDist}
          label={q.label}
          highlightDequeue={isExtractStep}
          highlightEnqueue={isLastAddTarget}
        />
      ) : null;
    default:
      return null;
  }
}

interface QueuesSlotProps {
  step: AlgorithmStep;
}

export function QueuesSlot({ step }: QueuesSlotProps) {
  const {
    queues,
    lastAddedToQueue,
    extractedInThisStep = false,
    currentVertexQueueIndex = 0,
    lastAddedToQueueIndex = 0,
    lastAddedToQueueSide = "right",
  } = step.auxiliary ?? {};

  if (!queues || queues.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-4 py-3 max-w-[280px] min-w-0">
      {queues.map((q, i) => {
        const isExtractStep = extractedInThisStep && currentVertexQueueIndex === i;
        const isLastAddTarget = lastAddedToQueue != null && lastAddedToQueueIndex === i;
        const block = renderQueueBlock(q, isExtractStep, isLastAddTarget, lastAddedToQueueSide);
        return block ? <div key={i}>{block}</div> : null;
      })}
    </div>
  );
}

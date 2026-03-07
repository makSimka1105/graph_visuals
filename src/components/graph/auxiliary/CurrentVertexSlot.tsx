"use client";

import type { AlgorithmStep } from "@/types/graph";

export function hasCurrentVertexData(step: AlgorithmStep | null): boolean {
  return step?.auxiliary?.currentVertex != null;
}

interface CurrentVertexSlotProps {
  step: AlgorithmStep;
}

export function CurrentVertexSlot({ step }: CurrentVertexSlotProps) {
  const currentVertex = step.auxiliary?.currentVertex;
  if (currentVertex == null) return null;

  const kosarajuData = step.data?.kosarajuExitIndices;
  const isKosaraju = kosarajuData != null;
  const phase = kosarajuData?.phase;
  const currentIndex = kosarajuData?.currentIndex;

  const label =
    isKosaraju && phase === "dfs1"
      ? "Assigning index"
      : isKosaraju && phase === "dfs2"
        ? "Visiting (index)"
        : "Visiting";

  return (
    <div className="flex flex-col gap-1.5 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg px-3 py-2 shrink-0 min-w-[80px] select-none">
      <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
        {label}
      </span>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium shrink-0">Vertex:</span>
          <span className="text-xs font-mono font-medium text-zinc-300 min-h-[20px]">
            {currentVertex}
          </span>
        </div>
        {isKosaraju && currentIndex !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium shrink-0">Index:</span>
            <span className="text-xs font-mono font-medium text-amber-400 tabular-nums">
              {currentIndex}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { ChevronLeft } from "lucide-react";
import type { DequeItemWithSource } from "@/types/graph";

export function DequeBlock({
  items,
  label,
  highlightExtract,
  highlightPushBack,
  highlightPushFront,
  itemsWithSource,
}: {
  items: string[];
  label?: string;
  highlightExtract?: boolean;
  highlightPushBack?: boolean;
  highlightPushFront?: boolean;
  itemsWithSource?: DequeItemWithSource[];
}) {
  const highlightClasses = "ring-2 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] bg-amber-500/30";
  const highlightLeft = highlightExtract || highlightPushFront;
  const displayItems = itemsWithSource ?? items.map((nodeId) => ({ nodeId, fromFront: false }));

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
      )}
      <div className="flex items-center">
        <div
          className={`flex items-center justify-center w-6 h-8 border border-r-0 border-zinc-600 rounded-l transition-all ${
            highlightLeft ? `${highlightClasses} text-amber-300` : "bg-zinc-800/80 text-amber-400"
          }`}
          title="front (extract <- / push front ->)"
        >
          <ChevronLeft className={`w-3.5 h-3.5 ${highlightPushFront ? "scale-x-[-1]" : ""}`} />
        </div>
        <div className="flex items-center gap-1 min-w-[60px] h-8 max-w-[200px] overflow-x-auto px-2 border-y border-zinc-600 bg-zinc-900/90 scrollbar-thin">
          {displayItems.length === 0 ? (
            <span className="text-[10px] text-zinc-500 italic">empty</span>
          ) : (
            displayItems.map(({ nodeId, fromFront }, i) => (
              <span
                key={`${nodeId}-${i}`}
                className={`flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-mono shrink-0 ${
                  fromFront
                    ? "bg-amber-500/25 text-amber-200 border border-amber-500/60"
                    : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                }`}
                title={fromFront ? "push_front (M0->M1)" : "push_back (M2->M1)"}
              >
                {nodeId}
              </span>
            ))
          )}
        </div>
        <div
          className={`flex items-center justify-center w-6 h-8 border border-l-0 border-zinc-600 rounded-r transition-all ${
            highlightPushBack ? `${highlightClasses} text-amber-300` : "bg-zinc-800/80 text-amber-400"
          }`}
          title="back (push back)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

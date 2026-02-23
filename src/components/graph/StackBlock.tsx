"use client";

import { ChevronLeft } from "lucide-react";

export function StackBlock({
  items,
  label,
  highlightTop,
  extractFromTop,
}: {
  items: string[];
  label?: string;
  highlightTop?: boolean;
  extractFromTop?: boolean;
}) {
  const highlightClasses = "ring-2 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] bg-amber-500/30";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>
      )}
      <div className="flex items-center">
        <div
          className="flex items-center justify-center w-6 h-8 border border-r-0 border-zinc-600 rounded-l bg-zinc-800/80 text-amber-400"
          title="bottom"
        >
          <span className="text-[8px]">⊥</span>
        </div>
        <div className="flex items-center gap-1 min-w-[60px] h-8 max-w-[200px] overflow-x-auto px-2 border-y border-zinc-600 bg-zinc-900/90 scrollbar-thin">
          {items.length === 0 ? (
            <span className="text-[10px] text-zinc-500 italic">empty</span>
          ) : (
            items.map((nodeId, i) => (
              <span
                key={`${nodeId}-${i}`}
                className="flex items-center justify-center px-1.5 py-0.5 rounded bg-zinc-800 text-xs font-mono text-zinc-200 border border-zinc-700 shrink-0"
              >
                {nodeId}
              </span>
            ))
          )}
        </div>
        <div
          className={`flex items-center justify-center w-6 h-8 border border-l-0 border-zinc-600 rounded-r transition-all ${
            highlightTop ? `${highlightClasses} text-amber-300` : "bg-zinc-800/80 text-amber-400"
          }`}
          title="top (pop/push)"
        >
          <ChevronLeft className={`w-3.5 h-3.5 ${extractFromTop ? "scale-x-[-1]" : ""}`} />
        </div>
      </div>
    </div>
  );
}

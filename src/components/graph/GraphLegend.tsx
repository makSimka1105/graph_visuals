"use client";

import { useAppSelector } from "@/store/hooks";

const baseLegend = [
  { label: "Start", color: "bg-violet-600", border: "border-violet-400" },
  { label: "End", color: "bg-rose-600", border: "border-rose-400" },
  { label: "Current", color: "bg-blue-600", border: "border-blue-400" },
  { label: "In Queue", color: "bg-yellow-600", border: "border-yellow-400" },
  { label: "Visited", color: "bg-zinc-700", border: "border-zinc-400" },
  { label: "Path", color: "bg-emerald-600", border: "border-emerald-400" },
];

const backwardLegend = [
  { label: "Backward Current", color: "bg-fuchsia-600", border: "border-fuchsia-400" },
  { label: "Backward Queue", color: "bg-amber-600", border: "border-amber-400" },
];

const BIDIRECTIONAL_IDS = new Set(["bidirectional-dijkstra", "bidirectional-astar"]);

export function GraphLegend() {
  const hasSteps = useAppSelector((s) => s.algorithm.steps.length > 0);
  const selectedId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  if (!hasSteps) return null;

  const isBidirectional = selectedId != null && BIDIRECTIONAL_IDS.has(selectedId);
  const items = isBidirectional ? [...baseLegend, ...backwardLegend] : baseLegend;

  return (
    <div className=" flex max-w-[30%] flex-wrap gap-1 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 overflow-hidden rounded-lg px-4 py-2 shrink-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded-full ${item.color} border ${item.border}`} />
          <span className="text-xs text-zinc-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useAppSelector } from "@/store/hooks";
import { SCC_PALETTE, MAX_SCC_COLORS } from "@/lib/sccColors";

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
const KOSARAJU_ID = "kosaraju";
const MST_IDS = new Set(["prim", "kruskal"]);

const mstLegend = [
  { label: "Gray (not in tree)", color: "bg-zinc-600", border: "border-zinc-500" },
  { label: "In MST", color: "bg-emerald-600", border: "border-emerald-400" },
  { label: "Considering", color: "bg-blue-600", border: "border-blue-400" },
  { label: "Rejected (dimmed)", color: "bg-zinc-600/40", border: "border-zinc-600/50" },
];

export function GraphLegend() {
  const hasSteps = useAppSelector((s) => s.algorithm.steps.length > 0);
  const selectedId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  const currentStep = useAppSelector((s) => {
    const steps = s.algorithm.steps;
    const idx = s.algorithm.currentStepIndex;
    if (steps.length === 0 || idx < 0) return null;
    return steps[Math.min(idx, steps.length - 1)] ?? null;
  });
  if (!hasSteps) return null;

  const isBidirectional = selectedId != null && BIDIRECTIONAL_IDS.has(selectedId);
  const isKosaraju = selectedId === KOSARAJU_ID;
  const isMst = selectedId != null && MST_IDS.has(selectedId);
  const sccCount = isKosaraju && currentStep?.data?.sccColors
    ? new Set(Object.values(currentStep.data.sccColors)).size
    : 0;

  const items =
    isMst
      ? mstLegend
      : isKosaraju && sccCount > 0
        ? SCC_PALETTE.slice(0, Math.min(sccCount, MAX_SCC_COLORS)).map((item, i) => ({
            label: `SCC ${i + 1}`,
            color: item.bg,
            border: item.border,
          }))
        : isBidirectional
          ? [...baseLegend, ...backwardLegend]
          : baseLegend;

  const exceedsLimit = isKosaraju && sccCount > MAX_SCC_COLORS;

  return (
    <div className="flex max-w-[30%] flex-col gap-1.5 select-none">
      {exceedsLimit && (
        <div className="flex items-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-1.5 text-[11px] text-amber-400">
          <span>Only up to {MAX_SCC_COLORS} components supported. Found {sccCount}.</span>
        </div>
      )}
      <div className="flex flex-wrap gap-1 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 overflow-hidden rounded-lg px-4 py-2 shrink-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color} border ${item.border}`} />
            <span className="text-xs text-zinc-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

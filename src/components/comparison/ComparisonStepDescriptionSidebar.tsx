"use client";

import { useAppSelector } from "@/store/hooks";

const HEURISTIC_ALG_IDS = new Set(["astar", "greedy-bfs", "bidirectional-astar"]);
const HEURISTIC_LABELS: Record<string, string> = {
  euclidean: "Euclidean",
  manhattan: "Manhattan",
  zero: "Zero",
};

type Source = "A" | "B";

interface ComparisonStepDescriptionSidebarProps {
  source: Source;
}

export function ComparisonStepDescriptionSidebar({ source }: ComparisonStepDescriptionSidebarProps) {
  const comp = useAppSelector((s) => s.comparison);
  const steps = source === "A" ? comp.stepsA : comp.stepsB;
  const { currentStepIndex } = comp;
  const algId = source === "A" ? comp.algA : comp.algB;
  const heuristicType = source === "A"
    ? (comp.graphA.heuristicType ?? "euclidean")
    : (comp.graphB.heuristicType ?? "euclidean");

  if (steps.length === 0) return null;

  const totalSteps = steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const notStarted = currentStepIndex < 0;
  const displayStepIndex = notStarted ? 0 : Math.min(currentStepIndex, totalSteps - 1);
  const currentStep = steps[displayStepIndex] ?? null;
  const displayStepNum = notStarted ? 0 : (isFinished ? totalSteps : currentStepIndex + 1);
  const showHeuristic = algId != null && HEURISTIC_ALG_IDS.has(algId);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
        {source}
      </p>
      <p className="text-xs text-zinc-300">
        {notStarted ? "Ready" : (currentStep?.description ?? (isFinished ? "Completed" : "-"))}
      </p>
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        <span className="text-[10px] text-zinc-600 tabular-nums">
          Step {displayStepNum} / {totalSteps}
        </span>
        {showHeuristic && (
          <span className="text-[10px] text-amber-400/90 font-medium" title="f = g + h: g — стоимость от старта, h — эвристическая оценка до цели">
            Heuristic: {HEURISTIC_LABELS[heuristicType] ?? heuristicType} (f = g + h)
          </span>
        )}
      </div>
    </div>
  );
}

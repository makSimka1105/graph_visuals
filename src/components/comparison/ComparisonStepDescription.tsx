"use client";

import { useAppSelector } from "@/store/hooks";

const HEURISTIC_ALG_IDS = new Set(["astar", "greedy-bfs", "bidirectional-astar"]);
const HEURISTIC_LABELS: Record<string, string> = {
  euclidean: "Euclidean",
  manhattan: "Manhattan",
  zero: "Zero",
};

type Source = "A" | "B";

interface ComparisonStepDescriptionProps {
  source: Source;
}

export function ComparisonStepDescription({ source }: ComparisonStepDescriptionProps) {
  const comp = useAppSelector((s) => s.comparison);
  const steps = source === "A" ? comp.stepsA : comp.stepsB;
  const { currentStepIndex, playbackState } = comp;
  const algId = source === "A" ? comp.algA : comp.algB;
  const heuristicType = source === "A"
    ? (comp.graphA.heuristicType ?? "euclidean")
    : (comp.graphB.heuristicType ?? "euclidean");

  const totalSteps = steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const notStarted = currentStepIndex < 0;
  const displayStepIndex = totalSteps > 0 ? (notStarted ? 0 : Math.min(currentStepIndex, totalSteps - 1)) : 0;
  const currentStep = steps.length > 0 ? steps[displayStepIndex] ?? null : null;
  const displayStepNum = notStarted ? 0 : (isFinished ? totalSteps : currentStepIndex + 1);
  const showHeuristic = totalSteps > 0 && algId != null && HEURISTIC_ALG_IDS.has(algId);

  if (!currentStep && playbackState === "idle") return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg px-6 py-3 max-w-lg">
      <p className="text-sm text-zinc-200 text-center">
        {currentStep?.description ?? (isFinished ? "Completed" : "Ready. Press Compare to run.")}
      </p>
      <div className="flex items-center justify-center gap-3 mt-1 flex-wrap">
        <span className="text-xs text-zinc-500">
          Step {displayStepNum} / {totalSteps}
        </span>
        {showHeuristic && (
          <span className="text-xs text-amber-400/90 font-medium" title="f = g + h: g — стоимость от старта, h — эвристическая оценка до цели">
            Heuristic: {HEURISTIC_LABELS[heuristicType] ?? heuristicType} (f = g + h)
          </span>
        )}
      </div>
    </div>
  );
}

"use client";

import { useAppSelector, useCurrentStep } from "@/store/hooks";

const HEURISTIC_ALG_IDS = new Set(["astar", "greedy-bfs", "bidirectional-astar"]);
const HEURISTIC_LABELS: Record<string, string> = {
  euclidean: "Euclidean",
  manhattan: "Manhattan",
  zero: "Zero",
};

export function StepDescription() {
  const { steps, currentStepIndex, currentStep } = useCurrentStep();
  const playbackState = useAppSelector((s) => s.algorithm.playbackState);
  const selectedAlgorithmId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  const heuristicType = useAppSelector((s) => s.graph.heuristicType);

  if (!currentStep && playbackState === "idle") return null;

  const showHeuristic =
    steps.length > 0 &&
    selectedAlgorithmId != null &&
    HEURISTIC_ALG_IDS.has(selectedAlgorithmId);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg px-6 py-3 max-w-lg">
      <p className="text-sm text-zinc-200 text-center">
        {currentStep?.description ?? "Ready. Press play or step forward."}
      </p>
      <div className="flex items-center justify-center gap-3 mt-1 flex-wrap">
        <span className="text-xs text-zinc-500">
          Step {currentStepIndex + 1} / {steps.length}
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

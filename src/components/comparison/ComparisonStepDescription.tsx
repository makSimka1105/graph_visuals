"use client";

import { useAppSelector } from "@/store/hooks";

type Source = "A" | "B";

interface ComparisonStepDescriptionProps {
  source: Source;
}

export function ComparisonStepDescription({ source }: ComparisonStepDescriptionProps) {
  const comp = useAppSelector((s) => s.comparison);
  const steps = source === "A" ? comp.stepsA : comp.stepsB;
  const { currentStepIndex, playbackState } = comp;

  const totalSteps = steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const notStarted = currentStepIndex < 0;
  const displayStepIndex = totalSteps > 0 ? (notStarted ? 0 : Math.min(currentStepIndex, totalSteps - 1)) : 0;
  const currentStep = steps.length > 0 ? steps[displayStepIndex] ?? null : null;
  const displayStepNum = notStarted ? 0 : (isFinished ? totalSteps : currentStepIndex + 1);

  if (!currentStep && playbackState === "idle") return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg px-6 py-3 max-w-lg">
      <p className="text-sm text-zinc-200 text-center">
        {currentStep?.description ?? (isFinished ? "Completed" : "Ready. Press Compare to run.")}
      </p>
      <p className="text-xs text-zinc-500 text-center mt-1">
        Step {displayStepNum} / {totalSteps}
      </p>
    </div>
  );
}

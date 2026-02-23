"use client";

import { useAppSelector, useCurrentStep } from "@/store/hooks";

export function StepDescription() {
  const { steps, currentStepIndex, currentStep } = useCurrentStep();
  const playbackState = useAppSelector((s) => s.algorithm.playbackState);

  if (!currentStep && playbackState === "idle") return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg px-6 py-3 max-w-lg">
      <p className="text-sm text-zinc-200 text-center">
        {currentStep?.description ?? "Ready. Press play or step forward."}
      </p>
      <p className="text-xs text-zinc-500 text-center mt-1">
        Step {currentStepIndex + 1} / {steps.length}
      </p>
    </div>
  );
}

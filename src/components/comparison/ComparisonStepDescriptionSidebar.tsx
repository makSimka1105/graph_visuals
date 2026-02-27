"use client";

import { useAppSelector } from "@/store/hooks";

type Source = "A" | "B";

interface ComparisonStepDescriptionSidebarProps {
  source: Source;
}

export function ComparisonStepDescriptionSidebar({ source }: ComparisonStepDescriptionSidebarProps) {
  const comp = useAppSelector((s) => s.comparison);
  const steps = source === "A" ? comp.stepsA : comp.stepsB;
  const { currentStepIndex } = comp;

  if (steps.length === 0) return null;

  const totalSteps = steps.length;
  const isFinished = currentStepIndex >= totalSteps;
  const notStarted = currentStepIndex < 0;
  const displayStepIndex = notStarted ? 0 : Math.min(currentStepIndex, totalSteps - 1);
  const currentStep = steps[displayStepIndex] ?? null;
  const displayStepNum = notStarted ? 0 : (isFinished ? totalSteps : currentStepIndex + 1);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
        {source}
      </p>
      <p className="text-xs text-zinc-300">
        {notStarted ? "Ready" : (currentStep?.description ?? (isFinished ? "Completed" : "—"))}
      </p>
      <p className="text-[10px] text-zinc-600 mt-1 tabular-nums">
        Step {displayStepNum} / {totalSteps}
      </p>
    </div>
  );
}

"use client";

import { useAppSelector } from "@/store/hooks";
import { AuxiliaryDisplayContent } from "@/components/graph/AuxiliaryDisplayContent";

type Source = "A" | "B";

interface ComparisonAuxiliaryDisplayProps {
  source: Source;
}

export function ComparisonAuxiliaryDisplay({ source }: ComparisonAuxiliaryDisplayProps) {
  const comp = useAppSelector((s) => s.comparison);
  const steps = source === "A" ? comp.stepsA : comp.stepsB;
  const { currentStepIndex } = comp;

  const totalSteps = steps.length;
  const displayStepIndex =
    totalSteps > 0 ? Math.min(Math.max(0, currentStepIndex), totalSteps - 1) : 0;
  const currentStep = steps.length > 0 ? steps[displayStepIndex] ?? null : null;

  return <AuxiliaryDisplayContent step={currentStep} />;
}

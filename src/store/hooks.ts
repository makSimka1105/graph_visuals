import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";
import type { AlgorithmStep } from "@/types/graph";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export function useCurrentStep() {
  const steps = useAppSelector((s) => s.algorithm.steps);
  const currentStepIndex = useAppSelector((s) => s.algorithm.currentStepIndex);
  const currentStep: AlgorithmStep | null =
    currentStepIndex >= 0 ? steps[currentStepIndex] ?? null : null;
  return { steps, currentStepIndex, currentStep };
}


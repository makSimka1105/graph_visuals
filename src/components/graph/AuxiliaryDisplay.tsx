"use client";

import { useCurrentStep } from "@/store/hooks";
import { AuxiliaryDisplayContent } from "./AuxiliaryDisplayContent";

export function AuxiliaryDisplay() {
  const { currentStep } = useCurrentStep();
  return <AuxiliaryDisplayContent step={currentStep} />;
}

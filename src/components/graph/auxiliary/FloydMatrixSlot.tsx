"use client";

import type { AlgorithmStep } from "@/types/graph";
import { FloydMatrixDisplay } from "../FloydMatrixDisplay";

export function hasFloydMatrixData(step: AlgorithmStep | null): boolean {
  return Boolean(step?.data?.floydMatrix);
}

interface FloydMatrixSlotProps {
  step: AlgorithmStep;
}

export function FloydMatrixSlot({ step }: FloydMatrixSlotProps) {
  const data = step.data?.floydMatrix;
  if (!data) return null;
  return <FloydMatrixDisplay data={data} />;
}

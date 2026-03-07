"use client";

import { getAuxiliaryDisplays, hasAnyAuxiliaryContent } from "@/lib/auxiliaryDisplayRegistry";
import { registerBuiltInAuxiliaryDisplays } from "./auxiliary";
import type { AlgorithmStep } from "@/types/graph";

registerBuiltInAuxiliaryDisplays();

interface AuxiliaryDisplayContentProps {
  step: AlgorithmStep | null;
}

export function AuxiliaryDisplayContent({ step }: AuxiliaryDisplayContentProps) {
  if (!hasAnyAuxiliaryContent(step)) return null;

  const displays = getAuxiliaryDisplays();

  return (
    <div className="flex flex-col-reverse items-end gap-2 min-w-0 shrink max-w-[70%] overflow-hidden select-none">
      {displays
        .filter((d) => d.hasData(step))
        .map((d) => {
          const Component = d.Component;
          return <Component key={d.id} step={step!} />;
        })}
    </div>
  );
}

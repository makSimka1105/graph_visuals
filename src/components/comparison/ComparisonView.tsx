"use client";

import { ComparisonSidebar } from "./ComparisonSidebar";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { ComparisonStepDescription } from "./ComparisonStepDescription";
import { ComparisonAuxiliaryDisplay } from "./ComparisonAuxiliaryDisplay";
import { useAppSelector } from "@/store/hooks";
import { getAllAlgorithms } from "@/algorithms/registry";

export function ComparisonView() {
  const { algA, algB } = useAppSelector((s) => s.comparison);
  const algorithms = getAllAlgorithms();
  const nameA = algA ? algorithms.find((a) => a.id === algA)?.name : "Algorithm A";
  const nameB = algB ? algorithms.find((a) => a.id === algB)?.name : "Algorithm B";

  return (
    <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-zinc-950 min-w-0">
      <ComparisonSidebar />

      <div className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 border-r border-zinc-800 relative min-w-0">
            <div className="absolute top-2 right-15 z-10 bg-zinc-900/90 text-zinc-300 text-xs px-2 py-1 rounded">
              {nameA}
            </div>
            <ComparisonStepDescription source="A" />
            <GraphCanvas source="A" />
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-nowrap items-end justify-between gap-4 min-w-0 pointer-events-none">
              <div className="pointer-events-auto" />
              <ComparisonAuxiliaryDisplay source="A" />
            </div>
          </div>
          <div className="flex-1 relative min-w-0">
            <div className="absolute top-2 right-15 z-10 bg-zinc-900/90 text-zinc-300 text-xs px-2 py-1 rounded">
              {nameB}
            </div>
            <ComparisonStepDescription source="B" />
            <GraphCanvas source="B" />
            <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-nowrap items-end justify-between gap-4 min-w-0 pointer-events-none">
              <div className="pointer-events-auto" />
              <ComparisonAuxiliaryDisplay source="B" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

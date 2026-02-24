"use client";

import "@/algorithms";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { GraphLegend } from "@/components/graph/GraphLegend";
import { AuxiliaryDisplay } from "@/components/graph/AuxiliaryDisplay";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { StepDescription } from "@/components/graph/StepDescription";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row w-screen h-[100dvh] min-h-screen overflow-hidden bg-zinc-950">
      <Sidebar />

      <div className="relative flex flex-col flex-1 h-full min-w-0">
        <div className="relative flex-1 min-h-0">
          <GraphCanvas />
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-nowrap items-end justify-between gap-4 min-w-0">
            <GraphLegend />
            <AuxiliaryDisplay />
          </div>
          <StepDescription />
        </div>
      </div>
    </div>
  );
}

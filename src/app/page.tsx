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
          <GraphLegend />
          <AuxiliaryDisplay />
          <StepDescription />
        </div>
      </div>
    </div>
  );
}

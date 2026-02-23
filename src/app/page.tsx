"use client";

import "@/algorithms";
import { GraphCanvas } from "@/components/graph/GraphCanvas";
import { GraphLegend } from "@/components/graph/GraphLegend";
import { AuxiliaryDisplay } from "@/components/graph/AuxiliaryDisplay";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { StepDescription } from "@/components/graph/StepDescription";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-zinc-950">
      <Sidebar />

      <div className="relative flex flex-col flex-1 h-full min-w-0">
        <Link href="/compare" className="absolute top-4 right-4 z-50">
          <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 gap-2">
            <BarChart3 className="w-4 h-4" />
            Compare
          </Button>
        </Link>

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

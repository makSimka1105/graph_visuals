"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  Rocket,
  CircleOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store/hooks";
import { useComparisonPlaybackEngine } from "@/hooks/useComparisonPlaybackEngine";
import { useComparisonRun } from "@/hooks/useComparisonRun";
import { GraphSettings } from "@/components/sidebar/GraphSettings";
import { ComparisonGraphCarousel } from "./ComparisonGraphCarousel";
import { ComparisonPlaybackControls } from "./ComparisonPlaybackControls";
import { ComparisonPlaybackButtons } from "./ComparisonPlaybackButtons";
import { ComparisonResultsDrawer } from "./ComparisonResultsDrawer";

export function ComparisonSidebar() {
  useComparisonPlaybackEngine();
  const { canRun, handleRun } = useComparisonRun();
  const [expanded, setExpanded] = useState(true);
  const comp = useAppSelector((s) => s.comparison);
  const hasSteps = comp.stepsA.length > 0 || comp.stepsB.length > 0;

  useEffect(() => {
    const update = () => setExpanded(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const prevHasSteps = useRef(false);
  useEffect(() => {
    if (hasSteps && !prevHasSteps.current && window.innerWidth < 768) {
      setExpanded(false);
    }
    prevHasSteps.current = hasSteps;
  }, [hasSteps]);

  if (!expanded) {
    return (
      <div className="fixed right-auto left-[calc(0.75rem+env(safe-area-inset-left))] top-[calc(0.75rem+env(safe-area-inset-top))] bottom-0 z-[60] pointer-events-auto">
        <div className="flex flex-col items-center py-3 md:py-4 px-2 md:px-0 gap-2 bg-zinc-950/95 backdrop-blur border border-zinc-800 rounded-xl md:border-zinc-800 md:w-14 shadow-lg md:shadow-none shrink-0 w-auto select-none">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(true)}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </Button>

          {!hasSteps && canRun && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRun}
              title="Compare"
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <Rocket className="w-4 h-4" />
            </Button>
          )}

          {!hasSteps && !canRun && (
            <div className="relative group flex flex-col items-center">
              <div className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-600">
                <CircleOff className="w-5 h-5" />
              </div>
              <div className="absolute right-full top-0 mr-2 hidden group-hover:block z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg px-3 py-2 w-48">
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {!comp.algA || !comp.algB
                    ? "Select algorithms in the panel"
                    : comp.graphA.nodes.length === 0 || comp.graphB.nodes.length === 0
                      ? "Load both graphs first"
                      : !comp.graphA.startNodeId || !comp.graphB.startNodeId
                        ? "Select start nodes"
                        : "Check algorithm compatibility"}
                </p>
              </div>
            </div>
          )}

          {hasSteps && (
            <ComparisonPlaybackButtons
              variant="ghost"
              orientation="vertical"
              showStepCounter={true}
              className="gap-2"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed md:static inset-0 md:inset-auto z-40 md:z-auto bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col overflow-hidden w-full md:w-[360px] md:flex-[0_0_360px] md:min-w-0 h-[100dvh] md:h-[100dvh] md:min-h-screen md:max-h-[100dvh] overscroll-contain">
      <div className="flex flex-col gap-1 px-4 py-3 border-b border-zinc-800 shrink-0 select-none">
        <h2 className="text-sm font-semibold text-zinc-100">Algorithm Comparison</h2>
        <div className="flex gap-2 justify-between">
          <Link href="/" className="shrink-0 min-w-0">
            <Button variant="outline" size="sm" className="w-auto bg-zinc-900 border-zinc-700 hover:bg-zinc-800 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="hidden md:flex flex-1 min-w-0">
            <ComparisonResultsDrawer />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(false)}
            className="shrink-0 bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 min-w-0 w-full overflow-hidden overscroll-contain">
        <div className="space-y-5 px-4 py-4 pb-12 w-full min-w-0 overflow-x-hidden [&>*]:min-w-0 [&>*]:max-w-full">
          <GraphSettings source="comparison" />
          <Separator className="bg-zinc-800" />
          <ComparisonGraphCarousel />
          <Separator className="bg-zinc-800" />
          <ComparisonPlaybackControls />
          <Separator className="bg-zinc-800" />
          
        </div>
      </ScrollArea>
    </div>
  );
}

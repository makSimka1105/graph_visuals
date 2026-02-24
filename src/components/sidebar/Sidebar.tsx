"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Rocket,
  CircleOff,
  BarChart3,
  PersonStandingIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  play,
  pause,
  stepForward,
  stepBackward,
  setSteps,
  resetPlayback,
} from "@/store/slices/algorithmSlice";
import { getAlgorithm } from "@/algorithms/registry";
import { usePlaybackEngine } from "@/hooks/usePlaybackEngine";
import { GraphSettings } from "./GraphSettings";
import { GraphInput } from "./GraphInput";
import { AlgorithmSelector } from "./AlgorithmSelector";
import { PlaybackControls } from "./PlaybackControls";

export function Sidebar() {
  usePlaybackEngine();
  const [expanded, setExpanded] = useState(true);
  const dispatch = useAppDispatch();
  const { selectedAlgorithmId, steps, currentStepIndex, playbackState } =
    useAppSelector((s) => s.algorithm);
  const graph = useAppSelector((s) => s.graph);

  const alg = selectedAlgorithmId ? getAlgorithm(selectedAlgorithmId) : null;
  const hasSteps = steps.length > 0;

  const canRun = useMemo(() => {
    if (!selectedAlgorithmId || !alg) return false;
    if (graph.nodes.length === 0 || !graph.startNodeId) return false;
    if (alg.requiresEndNode && !graph.endNodeId) return false;
    if (graph.directed && !alg.supportsDirected) return false;
    if (!graph.directed && !alg.supportsUndirected) return false;
    if (graph.startNodeId === graph.endNodeId) return false;
    return true;
  }, [selectedAlgorithmId, alg, graph]);

  const handleRun = () => {
    if (!canRun || !selectedAlgorithmId || !graph.startNodeId || !alg) return;
    const result = alg.run(graph, graph.startNodeId, graph.endNodeId ?? undefined);
    dispatch(setSteps(result));
  };

  const handlePlayPause = () => {
    if (playbackState === "playing") dispatch(pause());
    else dispatch(play());
  };

  useEffect(() => {
    const update = () => setExpanded(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!expanded) {
    return (
      <div className="fixed md:static bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-[calc(0.75rem+env(safe-area-inset-right))] left-auto md:left-auto z-[60] md:z-auto bg-zinc-950/95 backdrop-blur border border-zinc-800 rounded-xl md:rounded-none md:border-0 md:border-r md:border-zinc-800 flex flex-row md:flex-col items-center py-2 md:py-4 px-3 md:px-0 gap-3 shrink-0 md:h-[100dvh] md:min-h-screen md:max-h-[100dvh] md:w-14 shadow-lg md:shadow-none pointer-events-auto">
        <Button
          variant="ghost" size="icon"
          onClick={() => setExpanded(true)}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </Button>

        {!hasSteps && canRun && (
          <Button variant="ghost" size="icon" onClick={handleRun} title="Run Algorithm"
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <Rocket className="w-4 h-4" />
          </Button>
        )}

        {!hasSteps && !canRun && (
          <div className="relative group flex flex-col items-center">
            <div className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-600">
              <CircleOff className="w-5 h-5" />
            </div>
            <div className="absolute left-14 top-0 hidden group-hover:block z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg px-3 py-2 w-48">
              <p className="text-[11px] text-zinc-400 leading-snug">
                {!selectedAlgorithmId
                  ? "Select an algorithm in the panel to run"
                  : graph.nodes.length === 0
                    ? "Load a graph first"
                    : !graph.startNodeId
                      ? "Select start and end nodes"
                      : "Check algorithm compatibility"}
              </p>
            </div>
          </div>
        )}

        {hasSteps && (
          <>
            <Button variant="ghost" size="icon" onClick={() => dispatch(stepBackward())}
              disabled={currentStepIndex <= -1}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePlayPause}
              disabled={playbackState === "finished"}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30">
              {playbackState === "playing" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => dispatch(stepForward())}
              disabled={currentStepIndex >= steps.length - 1}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => dispatch(resetPlayback())}
              className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-[10px] text-zinc-500 tabular-nums">
              {currentStepIndex + 1}/{steps.length}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed md:static inset-0 md:inset-auto z-40 md:z-auto bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden w-full md:w-[360px] h-[100dvh] md:h-[100dvh] md:min-h-screen md:max-h-[100dvh] overscroll-contain">
      <div className="flex flex-col gap-1 px-4 py-3 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-100">Graph Algorithms</h2>
        <div className="flex gap-2">
        <Link href="/about" className="shrink-0 min-w-0">
            <Button variant="outline" size="sm" className="w-auto bg-zinc-900 border-zinc-700 hover:bg-zinc-800 gap-2">
              <PersonStandingIcon className="w-4 h-4" />
              
            </Button>
          </Link>
          <Link href="/compare" className="hidden md:flex flex-1 min-w-0">
            <Button variant="outline" size="sm" className="w-full bg-zinc-900 border-zinc-700 hover:bg-zinc-800 gap-2">
              <BarChart3 className="w-4 h-4" />
              Compare
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setExpanded(false)}
            className="shrink-0 bg-zinc-900 border-zinc-700 hover:bg-zinc-800">
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0 overscroll-contain">
        <div className="space-y-6 p-4">
          <GraphSettings />
          <Separator className="bg-zinc-800" />
          <GraphInput />
          <Separator className="bg-zinc-800" />
          <AlgorithmSelector />
          <Separator className="bg-zinc-800" />
          <PlaybackControls />
          <div className="h-10" />
        </div>
      </ScrollArea>
    </div>
  );
}

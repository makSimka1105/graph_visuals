"use client";

import { useMemo } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Rocket,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector, useCurrentStep } from "@/store/hooks";
import {
  play,
  pause,
  stepForward,
  stepBackward,
  setSpeed,
  setSteps,
  resetPlayback,
} from "@/store/slices/algorithmSlice";
import { getAlgorithm } from "@/algorithms/registry";

export function PlaybackControls() {
  const dispatch = useAppDispatch();
  const { steps, currentStepIndex, currentStep } = useCurrentStep();
  const { selectedAlgorithmId, playbackState, speed } = useAppSelector((s) => s.algorithm);
  const graph = useAppSelector((s) => s.graph);

  const alg = selectedAlgorithmId ? getAlgorithm(selectedAlgorithmId) : null;
  const hasSteps = steps.length > 0;

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!selectedAlgorithmId) errors.push("Select an algorithm");
    if (graph.nodes.length === 0) errors.push("Load a graph first");
    if (!graph.startNodeId) errors.push("Select a start node");

    if (alg) {
      if (alg.requiresEndNode && !graph.endNodeId)
        errors.push("This algorithm requires an end node");
      if (graph.directed && !alg.supportsDirected)
        errors.push("Algorithm doesn't support directed graphs");
      if (!graph.directed && !alg.supportsUndirected)
        errors.push("Algorithm doesn't support undirected graphs");
      if (graph.startNodeId === graph.endNodeId && graph.startNodeId !== null)
        errors.push("Start and end node must be different");
    }
    return errors;
  }, [selectedAlgorithmId, alg, graph.nodes.length, graph.startNodeId, graph.endNodeId, graph.directed]);

  const canRun = validation.length === 0;

  const handleRun = () => {
    if (!canRun || !selectedAlgorithmId || !graph.startNodeId) return;
    const algorithm = getAlgorithm(selectedAlgorithmId);
    if (!algorithm) return;
    const result = algorithm.run(graph, graph.startNodeId, graph.endNodeId ?? undefined);
    dispatch(setSteps(result));
  };

  const handlePlayPause = () => {
    if (playbackState === "playing") dispatch(pause());
    else dispatch(play());
  };

  const sliderValue = Math.round(((1550 - speed) / 1500) * 100);
  const handleSpeedSlider = (vals: number[]) => {
    const ms = Math.round(1550 - (vals[0] / 100) * 1500);
    dispatch(setSpeed(Math.max(50, Math.min(1500, ms))));
  };
  const speedLabel =
    speed <= 100 ? "Very Fast" : speed <= 300 ? "Fast" : speed <= 600 ? "Normal" : speed <= 1000 ? "Slow" : "Very Slow";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Playback
      </h3>

      {!hasSteps && (
        <>
          <Button onClick={handleRun} disabled={!canRun} className="w-full" variant="default">
            <Rocket className="w-4 h-4 mr-2" />
            Run Algorithm
          </Button>
          {!canRun && validation.length > 0 && (
            <div className="space-y-1">
              {validation.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-500">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-zinc-600" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {hasSteps && (
        <>
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => dispatch(stepBackward())} disabled={currentStepIndex <= -1}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handlePlayPause}
              disabled={playbackState === "finished"}
              className="w-10 h-10"
            >
              {playbackState === "playing" ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={() => dispatch(stepForward())} disabled={currentStepIndex >= steps.length - 1}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => dispatch(resetPlayback())}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center text-xs text-zinc-500">
            Step {currentStepIndex + 1} / {steps.length}
          </div>

          {currentStep && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-300">{currentStep.description}</p>
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-zinc-400 text-xs">Speed</Label>
          <span className="text-xs text-zinc-500">{speedLabel}</span>
        </div>
        <Slider
          min={1} max={100} step={1}
          value={[sliderValue]}
          onValueChange={handleSpeedSlider}
          className="[&_[role=slider]]:bg-zinc-300"
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { Rocket, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector, useCurrentStep } from "@/store/hooks";
import { setSpeed, setSteps } from "@/store/slices/algorithmSlice";
import { getAlgorithm } from "@/algorithms/registry";
import { checkCompatibility } from "@/lib/graphValidator";
import { PlaybackButtons } from "./PlaybackButtons";

export function PlaybackControls() {
  const dispatch = useAppDispatch();
  const { steps, currentStepIndex, currentStep } = useCurrentStep();
  const { selectedAlgorithmId, playbackState, speed } = useAppSelector((s) => s.algorithm);
  const graph = useAppSelector((s) => s.graph);

  const alg = selectedAlgorithmId ? getAlgorithm(selectedAlgorithmId) : null;
  const hasSteps = steps.length > 0;

  const compat = useMemo(
    () =>
      alg
        ? checkCompatibility(alg, {
            directed: graph.directed,
            weighted: graph.weighted,
            acyclic: graph.acyclic,
            nodes: graph.nodes,
            edges: graph.edges,
            heuristicType: graph.heuristicType,
            startNodeId: graph.startNodeId,
            endNodeId: graph.endNodeId,
          })
        : null,
    [alg, graph.directed, graph.weighted, graph.acyclic, graph.nodes, graph.edges, graph.heuristicType, graph.startNodeId, graph.endNodeId],
  );

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!selectedAlgorithmId) errors.push("Select an algorithm");
    if (graph.nodes.length === 0) errors.push("Load a graph first");
    return errors;
  }, [selectedAlgorithmId, graph.nodes.length]);

  const canRun = validation.length === 0 && (compat?.ok ?? true);

  const handleRun = () => {
    if (!canRun || !selectedAlgorithmId) return;
    const algorithm = getAlgorithm(selectedAlgorithmId);
    if (!algorithm) return;
    const startNode = graph.startNodeId ?? graph.nodes[0]?.id ?? "";
    const result = algorithm.run(graph, startNode, graph.endNodeId ?? undefined);
    dispatch(setSteps(result));
  };

  const sliderValue = Math.round(((1550 - speed) / 1500) * 100);
  const handleSpeedSlider = (vals: number[]) => {
    const ms = Math.round(1550 - (vals[0] / 100) * 1500);
    dispatch(setSpeed(Math.max(50, Math.min(1500, ms))));
  };
  const speedLabel =
    speed <= 100 ? "Very Fast" : speed <= 300 ? "Fast" : speed <= 600 ? "Normal" : speed <= 1000 ? "Slow" : "Very Slow";

  return (
    <div className="space-y-4 select-none">
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
                <div key={i} className="flex items-start gap-1.5 text-[11px] rounded px-2 py-1.5 bg-red-950/30 text-red-400">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
          {!canRun && validation.length === 0 && compat && !compat.ok && (
            <p className="text-[11px] text-zinc-500">Fix the issues above to run</p>
          )}
        </>
      )}

      {hasSteps && (
        <>
          <div className="flex flex-col items-center gap-2">
            <PlaybackButtons
              variant="outline"
              playButtonVariant="default"
              orientation="horizontal"
              showStepCounter={false}
            />
            <div className="text-center text-xs text-zinc-500">
              Step {currentStepIndex + 1} / {steps.length}
            </div>
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

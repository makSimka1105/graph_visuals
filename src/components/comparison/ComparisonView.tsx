"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Rocket, Play, Pause, SkipBack, SkipForward, RotateCcw, AlertTriangle, Info } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setGraph, setStartNode, setEndNode, setDirected, setWeighted, setAcyclic, setShowDistances } from "@/store/slices/graphSlice";
import { getAllAlgorithms, getAlgorithm } from "@/algorithms/registry";
import { generateRandomGraph } from "@/lib/graphGenerator";
import { applyLayout } from "@/lib/layoutEngine";
import { getPreset, presetList } from "@/lib/presets";
import { getGraphWarnings, checkCompatibility } from "@/lib/graphValidator";
import { MetricsChart } from "./MetricsChart";
import { ComparisonGraphCanvas } from "./ComparisonGraphCanvas";
import type { AlgorithmStep, AlgorithmMetrics } from "@/types/graph";

function getStepAt(steps: AlgorithmStep[], idx: number): AlgorithmStep | null {
  return idx >= 0 && idx < steps.length ? steps[idx] : null;
}

function countPathNodes(step: AlgorithmStep | null): number {
  return step ? Object.values(step.nodeStates).filter((s) => s === "path").length : 0;
}

function countVisitedNodes(step: AlgorithmStep | null): number {
  return step ? Object.values(step.nodeStates).filter((s) => s !== "default").length : 0;
}
import { Switch } from "@/components/ui/switch";

export function ComparisonView() {
  const dispatch = useAppDispatch();
  const graph = useAppSelector((s) => s.graph);

  const [algIdA, setAlgIdA] = useState<string>("");
  const [algIdB, setAlgIdB] = useState<string>("");
  const [metrics, setMetrics] = useState<AlgorithmMetrics[]>([]);
  const [stepsA, setStepsA] = useState<AlgorithmStep[]>([]);
  const [stepsB, setStepsB] = useState<AlgorithmStep[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(-1);
  const [preset, setPreset] = useState("");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const directed = useAppSelector((s) => s.graph.directed);
  const weighted = useAppSelector((s) => s.graph.weighted);
  const acyclic = useAppSelector((s) => s.graph.acyclic);
  const showDistances = useAppSelector((s) => s.graph.showDistances);

  const algorithms = getAllAlgorithms();

  const loadPreset = (id: string) => {
    setPreset(id);
    const p = getPreset(id);
    if (!p) return;
    const nodesCopy = p.nodes.map((n) => ({ ...n }));
    const edgesCopy = p.edges.map((e) => ({ ...e }));
    const hasPositions = nodesCopy.every((n) => n.x != null && n.y != null);
    const finalNodes = hasPositions ? nodesCopy : applyLayout(nodesCopy, edgesCopy).nodes;
    dispatch(setGraph({ nodes: finalNodes, edges: edgesCopy, sourcePresetId: id }));
    dispatch(setDirected(directed));
    dispatch(setWeighted(weighted));
    dispatch(setAcyclic(acyclic));
    dispatch(setShowDistances(showDistances));
    if (finalNodes.length > 0) {
      dispatch(setStartNode(finalNodes[0].id));
      dispatch(setEndNode(finalNodes[finalNodes.length - 1].id));
    }
    setStepsA([]);
    setStepsB([]);
    setMetrics([]);
    setCurrentStepIdx(-1);
  };

  const generateRandom = () => {
    const g = generateRandomGraph({ nodeCount: 15, edgeCount: 22, directed, weighted, acyclic });
    const laid = applyLayout(g.nodes, g.edges);
    dispatch(setGraph({ nodes: laid.nodes, edges: laid.edges, sourcePresetId: null }));
    dispatch(setDirected(directed));
    dispatch(setWeighted(weighted));
    dispatch(setAcyclic(acyclic));
    dispatch(setShowDistances(showDistances));
    if (laid.nodes.length > 0) {
      dispatch(setStartNode(laid.nodes[0].id));
      dispatch(setEndNode(laid.nodes[laid.nodes.length - 1].id));
    }
    setStepsA([]);
    setStepsB([]);
    setMetrics([]);
    setCurrentStepIdx(-1);
  };

  const runComparison = () => {
    if (!algIdA || !algIdB || !graph.startNodeId) return;

    const algA = getAlgorithm(algIdA);
    const algB = getAlgorithm(algIdB);
    if (!algA || !algB) return;

    const startA = performance.now();
    const resA = algA.run(graph, graph.startNodeId, graph.endNodeId ?? undefined);
    const timeA = performance.now() - startA;

    const startB = performance.now();
    const resB = algB.run(graph, graph.startNodeId, graph.endNodeId ?? undefined);
    const timeB = performance.now() - startB;

    setStepsA(resA);
    setStepsB(resB);
    setCurrentStepIdx(-1);

    const lastA = resA[resA.length - 1] ?? null;
    const lastB = resB[resB.length - 1] ?? null;
    const pathNodesA = countPathNodes(lastA);
    const pathNodesB = countPathNodes(lastB);
    const visitedA = countVisitedNodes(lastA);
    const visitedB = countVisitedNodes(lastB);

    setMetrics([
      {
        algorithmId: algIdA,
        algorithmName: algA.name,
        executionTimeMs: timeA,
        stepsCount: resA.length,
        pathLength: pathNodesA > 0 ? pathNodesA - 1 : null,
        visitedNodes: visitedA,
      },
      {
        algorithmId: algIdB,
        algorithmName: algB.name,
        executionTimeMs: timeB,
        stepsCount: resB.length,
        pathLength: pathNodesB > 0 ? pathNodesB - 1 : null,
        visitedNodes: visitedB,
      },
    ]);
  };

  const stepA = currentStepIdx < 0 ? null : getStepAt(stepsA, Math.min(currentStepIdx, stepsA.length - 1));
  const stepB = currentStepIdx < 0 ? null : getStepAt(stepsB, Math.min(currentStepIdx, stepsB.length - 1));
  const maxSteps = Math.max(stepsA.length, stepsB.length);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev >= maxSteps - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [speed, playing, maxSteps]);

  const handlePlay = () => {
    setPlaying((p) => !p);
  };

  const graphWarnings = getGraphWarnings(graph.nodes, graph.edges, graph.directed, graph.acyclic);
  const algA = algIdA ? getAlgorithm(algIdA) : null;
  const algB = algIdB ? getAlgorithm(algIdB) : null;
  const compatA = algA ? checkCompatibility(algA, { directed: graph.directed, weighted: graph.weighted, acyclic: graph.acyclic, nodes: graph.nodes, edges: graph.edges }) : null;
  const compatB = algB ? checkCompatibility(algB, { directed: graph.directed, weighted: graph.weighted, acyclic: graph.acyclic, nodes: graph.nodes, edges: graph.edges }) : null;

  const runErrors: string[] = [];
  if (graph.nodes.length === 0) runErrors.push("Load a graph first");
  if (!graph.startNodeId && graph.nodes.length > 0) runErrors.push("Select start node");
  if (!algIdA) runErrors.push("Select algorithm A");
  if (!algIdB) runErrors.push("Select algorithm B");
  if (algA?.requiresEndNode && !graph.endNodeId) runErrors.push("Select end node (required by algorithm)");
  if (graph.startNodeId === graph.endNodeId && graph.startNodeId != null) runErrors.push("Start and end must differ");
  if (compatA?.ok === false) runErrors.push(`A: ${compatA.warnings.find((w) => w.severity === "error")?.message ?? "incompatible"}`);
  if (compatB?.ok === false) runErrors.push(`B: ${compatB.warnings.find((w) => w.severity === "error")?.message ?? "incompatible"}`);

  const allWarnings = [
    ...graphWarnings,
    ...(compatA?.warnings ?? []).filter((w) => w.severity !== "error"),
    ...(compatB?.warnings ?? []).filter((w) => w.severity !== "error"),
  ];
  const canRun = runErrors.length === 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-end gap-3 md:gap-4 px-3 md:px-6 py-3 md:py-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <div className="space-y-1 w-full md:w-auto">
          <Label className="text-zinc-400 text-xs">Preset</Label>
          <Select value={preset} onValueChange={loadPreset}>
            <SelectTrigger className="w-full md:w-[160px] bg-zinc-900 border-zinc-700 text-zinc-200">
              <SelectValue placeholder="Preset..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {presetList.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={generateRandom} className="bg-zinc-900 border-zinc-700 w-full md:w-auto">
          Random Graph
        </Button>
        <Separator orientation="vertical" className="h-8 bg-zinc-800 hidden md:block" />
        <div className="space-y-1 w-full md:w-auto">
          <Label className="text-zinc-400 text-xs">Graph</Label>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex items-center gap-2">
              <Label className="text-zinc-500 text-xs">Directed</Label>
              <Switch checked={directed} onCheckedChange={(v) => dispatch(setDirected(v))} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-zinc-500 text-xs">Weighted</Label>
              <Switch checked={weighted} onCheckedChange={(v) => dispatch(setWeighted(v))} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-zinc-500 text-xs">Acyclic</Label>
              <Switch checked={acyclic} onCheckedChange={(v) => dispatch(setAcyclic(v))} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-zinc-500 text-xs">Show distances</Label>
              <Switch checked={showDistances} onCheckedChange={(v) => dispatch(setShowDistances(v))} />
            </div>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8 bg-zinc-800 hidden md:block" />
        <div className="space-y-1 w-full md:w-auto">
          <Label className="text-zinc-400 text-xs">Algorithm A</Label>
          <Select value={algIdA} onValueChange={setAlgIdA}>
            <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-700 text-zinc-200">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {algorithms.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 w-full md:w-auto">
          <Label className="text-zinc-400 text-xs">Algorithm B</Label>
          <Select value={algIdB} onValueChange={setAlgIdB}>
            <SelectTrigger className="w-full md:w-[180px] bg-zinc-900 border-zinc-700 text-zinc-200">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {algorithms.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={runComparison}
          disabled={!canRun}
          className="gap-2 w-full md:w-auto"
        >
          <Rocket className="w-4 h-4" />
          Compare
        </Button>
        <div className="flex flex-col gap-0.5 min-w-0 max-w-none md:max-w-[280px]">
          {runErrors.length > 0 && (
            <div className="space-y-0.5">
              {runErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-rose-400">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
          {canRun && allWarnings.length > 0 && (
            <div className="space-y-0.5">
              {allWarnings.map((w, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 text-[11px] ${
                    w.severity === "warning" ? "text-yellow-500/90" : "text-sky-400/80"
                  }`}
                >
                  {w.severity === "warning" ? (
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  ) : (
                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  )}
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {stepsA.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
            <Button variant="outline" size="icon" onClick={() => setCurrentStepIdx((i) => Math.max(-1, i - 1))} disabled={currentStepIdx <= -1}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="default" size="icon" onClick={handlePlay} className="w-10 h-10" disabled={currentStepIdx >= maxSteps - 1}>
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentStepIdx((i) => Math.min(maxSteps - 1, i + 1))} disabled={currentStepIdx >= maxSteps - 1}>
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { setCurrentStepIdx(-1); setPlaying(false); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <span className="text-xs text-zinc-500 tabular-nums">{currentStepIdx + 1} / {maxSteps}</span>
            <div className="flex items-center gap-2 w-24">
              <Slider
                min={1} max={100} step={1}
                value={[Math.round(((1550 - speed) / 1500) * 100)]}
                onValueChange={([v]) => setSpeed(Math.max(50, Math.min(1500, Math.round(1550 - (v / 100) * 1500))))}
                className="[&_[role=slider]]:bg-zinc-300"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="flex-1 h-1/2 md:h-auto border-b md:border-b-0 md:border-r border-zinc-800 relative">
            <div className="absolute top-2 left-2 z-10 bg-zinc-900/90 text-zinc-300 text-[11px] px-2 py-1 rounded">
              {algIdA ? algorithms.find((a) => a.id === algIdA)?.name : "Algorithm A"}
            </div>
            <ComparisonGraphCanvas step={stepA} />
          </div>
          <div className="flex-1 h-1/2 md:h-auto relative">
            <div className="absolute top-2 left-2 z-10 bg-zinc-900/90 text-zinc-300 text-[11px] px-2 py-1 rounded">
              {algIdB ? algorithms.find((a) => a.id === algIdB)?.name : "Algorithm B"}
            </div>
            <ComparisonGraphCanvas step={stepB} />
          </div>
        </div>

        {metrics.length > 0 && (
          <div className="h-[160px] md:h-[200px] shrink-0 border-t border-zinc-800 px-3 md:px-6 py-3 md:py-4">
            <MetricsChart metrics={metrics} />
          </div>
        )}
      </div>
    </div>
  );
}

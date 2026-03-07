"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, RotateCcw, Ruler } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setGraph, setStartNode, setEndNode, setHeuristicType, recalculateWeightsByGeometry } from "@/store/slices/graphSlice";
import { resetPlayback } from "@/store/slices/algorithmSlice";
import {
  setGraphA,
  setGraphB,
  setStartNodeA,
  setEndNodeA,
  setStartNodeB,
  setEndNodeB,
  comparisonClearResults,
  comparisonSetHeuristicTypeA,
  comparisonSetHeuristicTypeB,
  comparisonRecalculateWeightsA,
  comparisonRecalculateWeightsB,
} from "@/store/slices/comparisonSlice";
import { generateRandomGraph, edgeLimits } from "@/lib/graphGenerator";
import { getPreset, presetList, getRecommendedCategoryLabel, type PresetTags } from "@/lib/presets";
import { parseAdjacencyList } from "@/lib/graphParser";
import { applyLayout } from "@/lib/layoutEngine";

function presetMatches(tags: PresetTags, directed: boolean, acyclic: boolean): boolean {
  if (tags.directed === true && !directed) return false;
  if (acyclic && !tags.acyclic) return false;
  if (!acyclic && tags.acyclic === true) return false;
  return true;
}

type InputMode = "preset" | "random" | "custom";

export type GraphInputSource = "main" | "A" | "B";

interface GraphInputProps {
  source?: GraphInputSource;
}

export function GraphInput({ source = "main" }: GraphInputProps) {
  const dispatch = useAppDispatch();
  const isComparison = source !== "main";

  const mainDirected = useAppSelector((s) => s.graph.directed);
  const mainWeighted = useAppSelector((s) => s.graph.weighted);
  const mainAcyclic = useAppSelector((s) => s.graph.acyclic);
  const mainNodes = useAppSelector((s) => s.graph.nodes);
  const mainStartNodeId = useAppSelector((s) => s.graph.startNodeId);
  const mainEndNodeId = useAppSelector((s) => s.graph.endNodeId);
  const mainSourcePresetId = useAppSelector((s) => s.graph.sourcePresetId);
  const mainIsModified = useAppSelector((s) => s.graph.isModified);
  const mainHeuristicType = useAppSelector((s) => s.graph.heuristicType);
  const mainEdges = useAppSelector((s) => s.graph.edges);
  const selectedAlgorithmId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);

  const compDirected = useAppSelector((s) => s.comparison.directed);
  const compWeighted = useAppSelector((s) => s.comparison.weighted);
  const compAcyclic = useAppSelector((s) => s.comparison.acyclic);
  const compAlgA = useAppSelector((s) => s.comparison.algA);
  const compAlgB = useAppSelector((s) => s.comparison.algB);
  const compGraphA = useAppSelector((s) => s.comparison.graphA);
  const compGraphB = useAppSelector((s) => s.comparison.graphB);

  const directed = isComparison ? compDirected : mainDirected;
  const weighted = isComparison ? compWeighted : mainWeighted;
  const acyclic = isComparison ? compAcyclic : mainAcyclic;
  const nodes = isComparison
    ? source === "A"
      ? compGraphA.nodes
      : compGraphB.nodes
    : mainNodes;
  const sourcePresetId = isComparison
    ? source === "A"
      ? compGraphA.sourcePresetId
      : compGraphB.sourcePresetId
    : mainSourcePresetId;
  const isModified = isComparison
    ? source === "A"
      ? compGraphA.isModified
      : compGraphB.isModified
    : mainIsModified;
  const heuristicType = source === "main"
    ? mainHeuristicType
    : source === "A"
      ? compGraphA.heuristicType ?? "euclidean"
      : compGraphB.heuristicType ?? "euclidean";
  const edges = isComparison
    ? source === "A"
      ? compGraphA.edges
      : compGraphB.edges
    : mainEdges;

  const HEURISTIC_ALG_IDS = new Set(["astar", "greedy-bfs", "bidirectional-astar"]);
  const selectedAlgForHeuristic = source === "main"
    ? selectedAlgorithmId
    : source === "A"
      ? compAlgA
      : compAlgB;
  const showHeuristicSelector = selectedAlgForHeuristic != null && HEURISTIC_ALG_IDS.has(selectedAlgForHeuristic);

  const [mode, setMode] = useState<InputMode>("preset");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [nodeCount, setNodeCount] = useState(12);
  const [edgeCount, setEdgeCount] = useState(18);

  const startNodeId = isComparison
    ? source === "A"
      ? compGraphA.startNodeId
      : compGraphB.startNodeId
    : mainStartNodeId;
  const endNodeId = isComparison
    ? source === "A"
      ? compGraphA.endNodeId
      : compGraphB.endNodeId
    : mainEndNodeId;

  const limits = useMemo(
    () => edgeLimits(nodeCount, directed, acyclic),
    [nodeCount, directed, acyclic]
  );

  const clampedEdgeCount = Math.max(limits.min, Math.min(edgeCount, limits.max));

  const warnings: string[] = [];
  if (mode === "random") {
    if (clampedEdgeCount !== edgeCount) {
      warnings.push(`Edge count clamped to [${limits.min}..${limits.max}]`);
    }
    if (nodeCount > 60) {
      warnings.push("Large graphs may render slowly");
    }
    if (clampedEdgeCount === limits.min) {
      warnings.push("Minimum edges = spanning tree (graph is a tree)");
    }
  }

  const loadGraph = (
    nodesRaw: Parameters<typeof setGraph>[0]["nodes"],
    edgesRaw: Parameters<typeof setGraph>[0]["edges"],
    skipLayout = false,
    presetId?: string | null
  ) => {
    const nodesCopy = nodesRaw.map((n) => ({ ...n }));
    const edgesCopy = edgesRaw.map((e) => ({ ...e }));
    const hasPositions = skipLayout && nodesCopy.every((n) => n.x != null && n.y != null);
    const finalNodes = hasPositions ? nodesCopy : applyLayout(nodesCopy, edgesCopy).nodes;
    const payload = { nodes: finalNodes, edges: edgesCopy, sourcePresetId: presetId ?? null };
    if (source === "main") {
      dispatch(setGraph(payload));
      dispatch(resetPlayback());
      if (finalNodes.length > 0) {
        dispatch(setStartNode(finalNodes[0].id));
        dispatch(setEndNode(finalNodes[finalNodes.length - 1].id));
      }
    } else if (source === "A") {
      dispatch(setGraphA(payload));
      if (finalNodes.length > 0) {
        dispatch(setStartNodeA(finalNodes[0].id));
        dispatch(setEndNodeA(finalNodes[finalNodes.length - 1].id));
      }
    } else {
      dispatch(setGraphB(payload));
      if (finalNodes.length > 0) {
        dispatch(setStartNodeB(finalNodes[0].id));
        dispatch(setEndNodeB(finalNodes[finalNodes.length - 1].id));
      }
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = getPreset(presetId);
    if (preset) loadGraph(preset.nodes, preset.edges, true, presetId);
  };

  const handleResetPreset = () => {
    if (!sourcePresetId) return;
    const preset = getPreset(sourcePresetId);
    if (preset) loadGraph(preset.nodes, preset.edges, true, sourcePresetId);
    setSelectedPreset(sourcePresetId);
  };

  const handleGenerate = () => {
    const graph = generateRandomGraph({
      nodeCount,
      edgeCount: clampedEdgeCount,
      directed,
      weighted,
      acyclic,
    });
    loadGraph(graph.nodes, graph.edges, true, null);
  };

  const handleParseCustom = () => {
    const result = parseAdjacencyList(customInput, directed, weighted);
    if (result) loadGraph(result.nodes, result.edges, false, null);
  };

  return (
    <div className="space-y-4 min-w-0 select-none [&_textarea]:select-text">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Graph Input
      </h3>

      <div className="space-y-2 min-w-0">
        <Label className="text-zinc-300 text-xs">Source</Label>
        <div className="flex gap-2 min-w-0">
          <div className="flex-1 min-w-0 max-w-full">
            <Select value={mode} onValueChange={(v) => setMode(v as InputMode)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 w-full min-w-0 [&>span]:truncate">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="preset">Preset</SelectItem>
                <SelectItem value="random">Random</SelectItem>
                <SelectItem value="custom">Adjacency List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {nodes.length > 0 && edges.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (source === "main") {
                  dispatch(recalculateWeightsByGeometry());
                  dispatch(resetPlayback());
                } else if (source === "A") {
                  dispatch(comparisonRecalculateWeightsA());
                } else {
                  dispatch(comparisonRecalculateWeightsB());
                }
              }}
              className="shrink-0 border-zinc-600 text-zinc-400 hover:text-zinc-200"
              title="Recalculate edge weights by geometric distance between nodes"
            >
              <Ruler className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {mode === "preset" && (
        <div className="space-y-2 min-w-0">
          <div className="flex gap-2 min-w-0">
            <div className="flex-1 min-w-0 max-w-full">
            <Select value={selectedPreset} onValueChange={handleSelectPreset}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 w-full min-w-0 [&>span]:truncate">
                <SelectValue placeholder="Choose preset..." />
              </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 max-h-[300px] max-w-[200px]">
              {(() => {
                const recommended = presetList.filter((p) => presetMatches(p.tags, directed, acyclic));
                const other = presetList.filter((p) => !presetMatches(p.tags, directed, acyclic));
                return (
                  <>
                    {recommended.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-[10px] text-zinc-500 uppercase tracking-wider">
                          {getRecommendedCategoryLabel(directed, acyclic)}
                        </div>
                        {recommended.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="truncate">{p.name}</SelectItem>
                        ))}
                      </>
                    )}
                    {other.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Other</div>
                        {other.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="opacity-60 truncate">{p.name}</SelectItem>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </SelectContent>
          </Select>
            </div>
            {isModified && sourcePresetId && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleResetPreset}
                className="shrink-0 border-zinc-600 text-zinc-400 hover:text-zinc-200"
                title="Reset to original preset"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
          {isModified && sourcePresetId && (
            <p className="text-xs text-amber-500/90">Modified - click reset to restore original preset</p>
          )}
        </div>
      )}

      {mode === "random" && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-zinc-400 text-xs">Nodes</Label>
              <span className="text-xs text-zinc-500 tabular-nums">{nodeCount}</span>
            </div>
            <Slider
              min={3} max={80} step={1}
              value={[nodeCount]}
              onValueChange={([v]) => setNodeCount(v)}
              className="[&_[role=slider]]:bg-zinc-300"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-zinc-400 text-xs">Edges</Label>
              <span className="text-xs text-zinc-500 tabular-nums">
                {clampedEdgeCount}
                <span className="text-zinc-600"> / {limits.min}–{limits.max}</span>
              </span>
            </div>
            <Slider
              min={limits.min} max={limits.max} step={1}
              value={[clampedEdgeCount]}
              onValueChange={([v]) => setEdgeCount(v)}
              className="[&_[role=slider]]:bg-zinc-300"
            />
          </div>

          {warnings.length > 0 && (
            <div className="space-y-1">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-yellow-500/80">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleGenerate} className="w-full" variant="secondary">
            Generate
          </Button>
        </div>
      )}

      {mode === "custom" && (
        <div className="space-y-2">
          <Textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={"Format per line: source target [weight]\nExample:\n0 1 5\n0 2 3\n1 3 2"}
            className="bg-zinc-900 border-zinc-700 text-zinc-200 font-mono text-xs min-h-[120px] select-text"
          />
          <Button onClick={handleParseCustom} className="w-full" variant="secondary">
            Load Graph
          </Button>
        </div>
      )}

      {nodes.length > 0 && (
        <div className="space-y-2 pt-2 min-w-0">
          <Label className="text-zinc-400 text-xs">Start / End Node</Label>
          {showHeuristicSelector && (
            <div className="space-y-1.5">
              <Label className="text-zinc-500 text-[11px]">Heuristic</Label>
              <Select
                value={heuristicType}
                onValueChange={(v) => {
                  const val = v as "euclidean" | "manhattan" | "zero";
                  if (source === "main") {
                    dispatch(setHeuristicType(val));
                    dispatch(resetPlayback());
                  } else if (source === "A") {
                    dispatch(comparisonSetHeuristicTypeA(val));
                    dispatch(comparisonClearResults());
                  } else {
                    dispatch(comparisonSetHeuristicTypeB(val));
                    dispatch(comparisonClearResults());
                  }
                }}
              >
                <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 w-full min-w-0 [&>span]:truncate">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="euclidean">Euclidean</SelectItem>
                  <SelectItem value="manhattan">Manhattan</SelectItem>
                  <SelectItem value="zero">Zero</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                f = g + h, где g — стоимость от старта, h — оценка до цели.
              </p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {heuristicType === "euclidean" && "h = √((Δx)²+(Δy)²) — евклидово расстояние до цели"}
                {heuristicType === "manhattan" && "h = |Δx|+|Δy| — сумма горизонтальной и вертикальной дистанций"}
                {heuristicType === "zero" && "h = 0 — эквивалентно Dijkstra (f = g)"}
              </p>
            </div>
          )}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 min-w-0">
            <div className="min-w-0 overflow-hidden">
            <Select
              value={startNodeId ?? ""}
              onValueChange={(v) => {
                if (source === "main") {
                  dispatch(setStartNode(v));
                  dispatch(resetPlayback());
                } else if (source === "A") {
                  dispatch(setStartNodeA(v));
                  dispatch(comparisonClearResults());
                } else {
                  dispatch(setStartNodeB(v));
                  dispatch(comparisonClearResults());
                }
              }}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 w-full min-w-0 [&>span]:truncate">
                <SelectValue placeholder="Start" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-[200px] max-w-[160px]">
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id} className="truncate">{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            <div className="min-w-0 overflow-hidden">
            <Select
              value={endNodeId ?? ""}
              onValueChange={(v) => {
                if (source === "main") {
                  dispatch(setEndNode(v));
                  dispatch(resetPlayback());
                } else if (source === "A") {
                  dispatch(setEndNodeA(v));
                  dispatch(comparisonClearResults());
                } else {
                  dispatch(setEndNodeB(v));
                  dispatch(comparisonClearResults());
                }
              }}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 w-full min-w-0 [&>span]:truncate">
                <SelectValue placeholder="End" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-[200px] max-w-[160px]">
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id} className="truncate">{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

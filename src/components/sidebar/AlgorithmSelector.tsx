"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAlgorithm } from "@/store/slices/algorithmSlice";
import { setAlgA, setAlgB } from "@/store/slices/comparisonSlice";
import { getAllAlgorithms, getAlgorithm } from "@/algorithms/registry";
import { checkCompatibility, type GraphWarning } from "@/lib/graphValidator";

const severityConfig: Record<GraphWarning["severity"], { icon: typeof AlertTriangle; containerCls: string; textCls: string }> = {
  error:   { icon: AlertTriangle, containerCls: "bg-red-950/30 text-red-400",        textCls: "text-red-400" },
  warning: { icon: AlertCircle,   containerCls: "bg-yellow-950/20 text-yellow-500/80", textCls: "text-yellow-500/80" },
  info:    { icon: Info,          containerCls: "bg-sky-950/20 text-sky-400/80",       textCls: "text-sky-400/80" },
};

export type AlgorithmSelectorSource = "main" | "A" | "B";

interface AlgorithmSelectorProps {
  source?: AlgorithmSelectorSource;
}

export function AlgorithmSelector({ source = "main" }: AlgorithmSelectorProps) {
  const dispatch = useAppDispatch();
  const isComparison = source !== "main";

  const mainSelectedId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  const mainDirected = useAppSelector((s) => s.graph.directed);
  const mainWeighted = useAppSelector((s) => s.graph.weighted);
  const mainAcyclic = useAppSelector((s) => s.graph.acyclic);
  const mainNodes = useAppSelector((s) => s.graph.nodes);
  const mainEdges = useAppSelector((s) => s.graph.edges);

  const compAlgA = useAppSelector((s) => s.comparison.algA);
  const compAlgB = useAppSelector((s) => s.comparison.algB);
  const compDirected = useAppSelector((s) => s.comparison.directed);
  const compWeighted = useAppSelector((s) => s.comparison.weighted);
  const compAcyclic = useAppSelector((s) => s.comparison.acyclic);
  const compGraphA = useAppSelector((s) => s.comparison.graphA);
  const compGraphB = useAppSelector((s) => s.comparison.graphB);

  const selectedId = isComparison
    ? source === "A"
      ? compAlgA
      : compAlgB
    : mainSelectedId;
  const directed = isComparison ? compDirected : mainDirected;
  const weighted = isComparison ? compWeighted : mainWeighted;
  const acyclic = isComparison ? compAcyclic : mainAcyclic;
  const nodes = isComparison
    ? source === "A"
      ? compGraphA.nodes
      : compGraphB.nodes
    : mainNodes;
  const edges = isComparison
    ? source === "A"
      ? compGraphA.edges
      : compGraphB.edges
    : mainEdges;

  const mainHeuristicType = useAppSelector((s) => s.graph.heuristicType);
  const mainStartNodeId = useAppSelector((s) => s.graph.startNodeId);
  const mainEndNodeId = useAppSelector((s) => s.graph.endNodeId);
  const heuristicType = isComparison ? "euclidean" : mainHeuristicType;
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
  const graphState = useMemo(
    () => ({ directed, weighted, acyclic, nodes, edges, heuristicType, startNodeId, endNodeId }),
    [directed, weighted, acyclic, nodes, edges, heuristicType, startNodeId, endNodeId],
  );

  const algorithms = getAllAlgorithms();
  const selectedAlg = selectedId ? getAlgorithm(selectedId) : null;
  const selectedCompat = useMemo(
    () => selectedAlg ? checkCompatibility(selectedAlg, graphState) : null,
    [selectedAlg, graphState],
  );

  return (
    <div className="space-y-3 min-w-0 w-full overflow-hidden select-none [&_.alg-description]:select-text">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Algorithm
      </h3>
      <div className="w-full min-w-0 max-w-full">
      <Select
        value={selectedId ?? ""}
        onValueChange={(v) => {
          const val = v || null;
          if (source === "main") dispatch(selectAlgorithm(val));
          else if (source === "A") dispatch(setAlgA(val));
          else dispatch(setAlgB(val));
        }}
      >
        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 w-full min-w-0 [&>span]:truncate">
          <SelectValue placeholder="Select algorithm..." />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700 max-w-[200px]">
          {algorithms.map((alg) => (
            <SelectItem key={alg.id} value={alg.id}>
              {alg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>

      {selectedAlg && (
        <div className="space-y-2">
          <p className="alg-description text-xs text-zinc-500 leading-relaxed">{selectedAlg.description}</p>
          <div className="flex flex-wrap gap-1">
            {selectedAlg.requiresEndNode && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-800/60 cursor-help">requires end node</span>
                </TooltipTrigger>
                <TooltipContent>You must set an end node. Algorithm will not run without it.</TooltipContent>
              </Tooltip>
            )}
            {selectedAlg.requiresNonNegativeWeights && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-400 border border-amber-800/50 cursor-help">non-negative only</span>
                </TooltipTrigger>
                <TooltipContent>Requires non-negative edge weights. Incorrect results with negative edges.</TooltipContent>
              </Tooltip>
            )}
            {(selectedAlg.id === "levit" || selectedAlg.id === "desopo-pape") && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-400 border border-amber-800/50 cursor-help">may abort on negative cycle</span>
                </TooltipTrigger>
                <TooltipContent>If a negative weight cycle exists, the algorithm may abort without finding a path.</TooltipContent>
              </Tooltip>
            )}
            {!selectedAlg.requiresNonNegativeWeights && selectedAlg.supportsWeighted && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 cursor-help">handles negative</span>
                </TooltipTrigger>
                <TooltipContent>Supports negative edge weights. May abort on negative cycles (Levit, D'Esopo-Pape).</TooltipContent>
              </Tooltip>
            )}
            {(selectedAlg.id === "astar" || selectedAlg.id === "greedy-bfs" || selectedAlg.id === "bidirectional-astar") && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/40 text-sky-400 border border-sky-800/50 cursor-help">uses heuristic</span>
                </TooltipTrigger>
                <TooltipContent>Heuristic: Euclidean, Manhattan, or Zero (selectable in Graph Input). Euclidean uses distance from node positions.</TooltipContent>
              </Tooltip>
            )}
            {(selectedAlg.id === "bidirectional-dijkstra" || selectedAlg.id === "bidirectional-astar") && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-900/40 text-fuchsia-400 border border-fuchsia-800/50 cursor-help">bidirectional</span>
                </TooltipTrigger>
                <TooltipContent>Searches from both start and end. Typically explores fewer nodes.</TooltipContent>
              </Tooltip>
            )}
            {!selectedAlg.supportsWeighted && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-help">ignores weights</span>
                </TooltipTrigger>
                <TooltipContent>Treats all edges as weight 1. Finds shortest path by hop count.</TooltipContent>
              </Tooltip>
            )}
            {selectedAlg.id === "floyd-warshall" && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/40 text-sky-400 border border-sky-800/50 cursor-help">all-pairs</span>
                </TooltipTrigger>
                <TooltipContent>Computes shortest paths between all pairs of nodes. O(V³).</TooltipContent>
              </Tooltip>
            )}
            {selectedAlg.id === "kosaraju" && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 cursor-help">SCC</span>
                </TooltipTrigger>
                <TooltipContent>Finds strongly connected components. Directed graphs only. Vertices colored by SCC.</TooltipContent>
              </Tooltip>
            )}
            {(selectedAlg.id === "prim" || selectedAlg.id === "kruskal") && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 cursor-help">MST</span>
                </TooltipTrigger>
                <TooltipContent>Minimum spanning tree. Gray = not in tree, green = in MST. Undirected weighted graphs only.</TooltipContent>
              </Tooltip>
            )}
            {!selectedAlg.supportsUndirected && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-900/40 text-violet-400 border border-violet-800/50 cursor-help">directed only</span>
                </TooltipTrigger>
                <TooltipContent>This algorithm works only on directed graphs.</TooltipContent>
              </Tooltip>
            )}
            {!selectedAlg.supportsDirected && (
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-900/40 text-teal-400 border border-teal-800/50 cursor-help">undirected only</span>
                </TooltipTrigger>
                <TooltipContent>This algorithm works only on undirected graphs.</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      )}

      {selectedCompat && selectedCompat.warnings.length > 0 && (
        <div className="space-y-1.5">
          {selectedCompat.warnings.map((w, i) => {
            const cfg = severityConfig[w.severity];
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex items-start gap-1.5 text-[11px] rounded px-2 py-1.5 ${cfg.containerCls}`}>
                <Icon className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{w.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

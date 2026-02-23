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
import { getAllAlgorithms, getAlgorithm } from "@/algorithms/registry";
import { checkCompatibility, type GraphWarning } from "@/lib/graphValidator";

const severityConfig: Record<GraphWarning["severity"], { icon: typeof AlertTriangle; containerCls: string; textCls: string }> = {
  error:   { icon: AlertTriangle, containerCls: "bg-red-950/30 text-red-400",        textCls: "text-red-400" },
  warning: { icon: AlertCircle,   containerCls: "bg-yellow-950/20 text-yellow-500/80", textCls: "text-yellow-500/80" },
  info:    { icon: Info,          containerCls: "bg-sky-950/20 text-sky-400/80",       textCls: "text-sky-400/80" },
};

export function AlgorithmSelector() {
  const dispatch = useAppDispatch();
  const selectedId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  const directed = useAppSelector((s) => s.graph.directed);
  const weighted = useAppSelector((s) => s.graph.weighted);
  const acyclic = useAppSelector((s) => s.graph.acyclic);
  const nodes = useAppSelector((s) => s.graph.nodes);
  const edges = useAppSelector((s) => s.graph.edges);

  const algorithms = getAllAlgorithms();

  const graphState = useMemo(
    () => ({ directed, weighted, acyclic, nodes, edges }),
    [directed, weighted, acyclic, nodes, edges],
  );

  const selectedAlg = selectedId ? getAlgorithm(selectedId) : null;
  const selectedCompat = useMemo(
    () => selectedAlg ? checkCompatibility(selectedAlg, graphState) : null,
    [selectedAlg, graphState],
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Algorithm
      </h3>
      <Select
        value={selectedId ?? ""}
        onValueChange={(v) => dispatch(selectAlgorithm(v || null))}
      >
        <SelectTrigger className={`bg-zinc-900 border-zinc-700 text-zinc-200 ${selectedCompat && !selectedCompat.ok ? "border-red-800" : ""}`}>
          <SelectValue placeholder="Select algorithm..." />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {algorithms.map((alg) => {
            const compat = checkCompatibility(alg, graphState);
            const firstError = compat.warnings.find((w) => w.severity === "error");
            return (
              <SelectItem
                key={alg.id}
                value={alg.id}
                disabled={!compat.ok}
                className={!compat.ok ? "opacity-40" : ""}
              >
                <div className="flex items-center gap-2">
                  <span>{alg.name}</span>
                  {firstError && (
                    <span className="text-[10px] text-red-400">({firstError.message})</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {selectedAlg && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 leading-relaxed">{selectedAlg.description}</p>
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
                <TooltipContent>Uses Euclidean distance from node positions as heuristic.</TooltipContent>
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

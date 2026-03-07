"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDirected, setWeighted, setAcyclic, setShowDistances } from "@/store/slices/graphSlice";
import { resetPlayback } from "@/store/slices/algorithmSlice";
import {
  comparisonSetDirected,
  comparisonSetWeighted,
  comparisonSetAcyclic,
  comparisonSetShowDistances,
} from "@/store/slices/comparisonSlice";
import { getAlgorithm } from "@/algorithms/registry";
import { getGraphWarnings } from "@/lib/graphValidator";

export type GraphSettingsSource = "main" | "comparison";

interface GraphSettingsProps {
  source?: GraphSettingsSource;
}

export function GraphSettings({ source = "main" }: GraphSettingsProps) {
  const dispatch = useAppDispatch();
  const isComparison = source === "comparison";

  const mainDirected = useAppSelector((s) => s.graph.directed);
  const mainWeighted = useAppSelector((s) => s.graph.weighted);
  const mainAcyclic = useAppSelector((s) => s.graph.acyclic);
  const mainShowDistances = useAppSelector((s) => s.graph.showDistances);
  const mainSelectedAlgId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  const mainNodes = useAppSelector((s) => s.graph.nodes);
  const mainEdges = useAppSelector((s) => s.graph.edges);

  const compDirected = useAppSelector((s) => s.comparison.directed);
  const compWeighted = useAppSelector((s) => s.comparison.weighted);
  const compAcyclic = useAppSelector((s) => s.comparison.acyclic);
  const compShowDistances = useAppSelector((s) => s.comparison.showDistances);
  const compAlgA = useAppSelector((s) => s.comparison.algA);
  const compGraphA = useAppSelector((s) => s.comparison.graphA);

  const directed = isComparison ? compDirected : mainDirected;
  const weighted = isComparison ? compWeighted : mainWeighted;
  const acyclic = isComparison ? compAcyclic : mainAcyclic;
  const showDistances = isComparison ? compShowDistances : mainShowDistances;
  const selectedAlgId = isComparison ? compAlgA : mainSelectedAlgId;
  const nodes = isComparison ? compGraphA.nodes : mainNodes;
  const edges = isComparison ? compGraphA.edges : mainEdges;

  const selectedAlg = selectedAlgId ? getAlgorithm(selectedAlgId) : null;
  const warnings = useMemo(
    () => getGraphWarnings(nodes, edges, directed, acyclic, weighted, selectedAlg),
    [nodes, edges, directed, acyclic, weighted, selectedAlg],
  );

  return (
    <div className="space-y-3 min-w-0 w-full overflow-hidden select-none">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Graph Settings
      </h3>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-4 gap-y-1 min-w-0">
        <div className="flex items-center justify-between">
          <Label htmlFor="directed" className="text-zinc-300 text-sm">Directed</Label>
          <Switch
            id="directed"
            checked={directed}
            onCheckedChange={(v) => {
              if (isComparison) {
                dispatch(comparisonSetDirected(v));
              } else {
                dispatch(setDirected(v));
                dispatch(resetPlayback());
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="weighted" className="text-zinc-300 text-sm">Weighted</Label>
          <Switch
            id="weighted"
            checked={weighted}
            onCheckedChange={(v) => {
              if (isComparison) {
                dispatch(comparisonSetWeighted(v));
              } else {
                dispatch(setWeighted(v));
                dispatch(resetPlayback());
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="acyclic" className="text-zinc-300 text-sm">Acyclic</Label>
          <Switch
            id="acyclic"
            checked={acyclic}
            onCheckedChange={(v) => {
              if (isComparison) {
                dispatch(comparisonSetAcyclic(v));
              } else {
                dispatch(setAcyclic(v));
                dispatch(resetPlayback());
              }
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showDistances" className="text-zinc-300 text-sm">
            {selectedAlgId === "kosaraju" ? "Show exit indices" : "Show distances"}
          </Label>
          <Switch
            id="showDistances"
            checked={showDistances}
            onCheckedChange={(v) => {
              if (isComparison) {
                dispatch(comparisonSetShowDistances(v));
              } else {
                dispatch(setShowDistances(v));
              }
            }}
          />
        </div>

      </div>
      
      {showDistances && (
        <p className="text-[11px] text-zinc-500 -mt-1">
          {selectedAlgId === "kosaraju"
            ? "Display exit indices (post-order) during Kosaraju playback"
            : "Display shortest distance to each node during algorithm playback"}
        </p>
      )}

      {acyclic && (
        <p className="text-[11px] text-zinc-500 -mt-1">
          {directed ? "DAG: directed acyclic graph" : "Tree / Forest: undirected acyclic"}
        </p>
      )}

      {warnings.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {warnings.map((w, i) => {
            const isError = w.severity === "error";
            const isWarn = w.severity === "warning";
            const style = isError
              ? "bg-red-950/30 text-red-400"
              : isWarn
                ? "bg-yellow-950/20 text-yellow-500/80"
                : "bg-sky-950/20 text-sky-400/80";
            return (
              <div
                key={i}
                className={`flex items-start gap-1.5 text-[11px] rounded px-2 py-1.5 ${style}`}
              >
                {isError || isWarn ? (
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                )}
                <span>{w.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

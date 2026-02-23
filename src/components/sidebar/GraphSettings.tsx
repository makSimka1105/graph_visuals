"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDirected, setWeighted, setAcyclic, setShowDistances } from "@/store/slices/graphSlice";
import { resetPlayback } from "@/store/slices/algorithmSlice";
import { getGraphWarnings } from "@/lib/graphValidator";

export function GraphSettings() {
  const dispatch = useAppDispatch();
  const directed = useAppSelector((s) => s.graph.directed);
  const weighted = useAppSelector((s) => s.graph.weighted);
  const acyclic = useAppSelector((s) => s.graph.acyclic);
  const showDistances = useAppSelector((s) => s.graph.showDistances);
  const nodes = useAppSelector((s) => s.graph.nodes);
  const edges = useAppSelector((s) => s.graph.edges);

  const warnings = useMemo(
    () => getGraphWarnings(nodes, edges, directed, acyclic),
    [nodes, edges, directed, acyclic],
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Graph Settings
      </h3>
      <div className="grid grid-cols-2 gap-x-10 space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="directed" className="text-zinc-300 text-sm">Directed</Label>
          <Switch
            id="directed"
            checked={directed}
            onCheckedChange={(v) => {
              dispatch(setDirected(v));
              dispatch(resetPlayback());
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="weighted" className="text-zinc-300 text-sm">Weighted</Label>
          <Switch
            id="weighted"
            checked={weighted}
            onCheckedChange={(v) => {
              dispatch(setWeighted(v));
              dispatch(resetPlayback());
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="acyclic" className="text-zinc-300 text-sm">Acyclic</Label>
          <Switch
            id="acyclic"
            checked={acyclic}
            onCheckedChange={(v) => {
              dispatch(setAcyclic(v));
              dispatch(resetPlayback());
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showDistances" className="text-zinc-300 text-sm">Show distances</Label>
          <Switch
            id="showDistances"
            checked={showDistances}
            onCheckedChange={(v) => {
              dispatch(setShowDistances(v));
            }}
          />
        </div>

      </div>
      
      {showDistances && (
        <p className="text-[11px] text-zinc-500 -mt-1">
          Display shortest distance to each node during algorithm playback
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
            const isWarn = w.severity === "warning";
            return (
              <div
                key={i}
                className={`flex items-start gap-1.5 text-[11px] rounded px-2 py-1.5 ${
                  isWarn
                    ? "bg-yellow-950/20 text-yellow-500/80"
                    : "bg-sky-950/20 text-sky-400/80"
                }`}
              >
                {isWarn ? (
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

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
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setGraph, setStartNode, setEndNode } from "@/store/slices/graphSlice";
import { resetPlayback } from "@/store/slices/algorithmSlice";
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

export function GraphInput() {
  const dispatch = useAppDispatch();
  const directed = useAppSelector((s) => s.graph.directed);
  const weighted = useAppSelector((s) => s.graph.weighted);
  const acyclic = useAppSelector((s) => s.graph.acyclic);
  const nodes = useAppSelector((s) => s.graph.nodes);
  const sourcePresetId = useAppSelector((s) => s.graph.sourcePresetId);
  const isModified = useAppSelector((s) => s.graph.isModified);

  const [mode, setMode] = useState<InputMode>("preset");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [nodeCount, setNodeCount] = useState(12);
  const [edgeCount, setEdgeCount] = useState(18);
  const [startId, setStartId] = useState("");
  const [endId, setEndId] = useState("");

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
    dispatch(setGraph({ nodes: finalNodes, edges: edgesCopy, sourcePresetId: presetId ?? null }));
    dispatch(resetPlayback());
    if (finalNodes.length > 0) {
      setStartId(finalNodes[0].id);
      setEndId(finalNodes[finalNodes.length - 1].id);
      dispatch(setStartNode(finalNodes[0].id));
      dispatch(setEndNode(finalNodes[finalNodes.length - 1].id));
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
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Graph Input
      </h3>

      <div className="space-y-2">
        <Label className="text-zinc-300 text-xs">Source</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as InputMode)}>
          <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="preset">Preset</SelectItem>
            <SelectItem value="random">Random</SelectItem>
            <SelectItem value="custom">Adjacency List</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "preset" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Select value={selectedPreset} onValueChange={handleSelectPreset}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200 flex-1">
                <SelectValue placeholder="Choose preset..." />
              </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 max-h-[300px]">
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
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </>
                    )}
                    {other.length > 0 && (
                      <>
                        <div className="px-2 py-1 text-[10px] text-zinc-600 uppercase tracking-wider mt-1">Other</div>
                        {other.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="opacity-60">{p.name}</SelectItem>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </SelectContent>
          </Select>
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
            <p className="text-xs text-amber-500/90">Modified — click reset to restore original preset</p>
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
            className="bg-zinc-900 border-zinc-700 text-zinc-200 font-mono text-xs min-h-[120px]"
          />
          <Button onClick={handleParseCustom} className="w-full" variant="secondary">
            Load Graph
          </Button>
        </div>
      )}

      {nodes.length > 0 && (
        <div className="space-y-2 pt-2">
          <Label className="text-zinc-400 text-xs">Start / End Node</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={startId} onValueChange={(v) => { setStartId(v); dispatch(setStartNode(v)); dispatch(resetPlayback()); }}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                <SelectValue placeholder="Start" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-[200px]">
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={endId} onValueChange={(v) => { setEndId(v); dispatch(setEndNode(v)); dispatch(resetPlayback()); }}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                <SelectValue placeholder="End" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-[200px]">
                {nodes.map((n) => (
                  <SelectItem key={n.id} value={n.id}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

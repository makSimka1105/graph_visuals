"use client";

import { useAppSelector } from "@/store/hooks";
import { GitBranch } from "lucide-react";
import type { GraphNode } from "@/types/graph";

interface EmptyStateProps {
  nodesOverride?: GraphNode[];
}

export function EmptyState({ nodesOverride }: EmptyStateProps) {
  const mainNodes = useAppSelector((s) => s.graph.nodes);
  const hasNodes = (nodesOverride ?? mainNodes).length > 0;
  if (hasNodes) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="text-center space-y-4">
        <GitBranch className="w-16 h-16 text-zinc-700 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-500">No Graph Loaded</h2>
          <p className="text-sm text-zinc-600 max-w-xs">
            Open the menu to load a preset, generate a random graph, or enter your own adjacency list.
          </p>
        </div>
      </div>
    </div>
  );
}

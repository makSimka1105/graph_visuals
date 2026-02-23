import type { Graph } from "@/types/graph";

export function initDistPrev(graph: Graph, startNode: string) {
  const dist: Record<string, number> = {};
  const prev: Record<string, { nodeId: string; edgeId: string } | null> = {};
  for (const node of graph.nodes) dist[node.id] = Infinity;
  dist[startNode] = 0;
  prev[startNode] = null;
  return { dist, prev };
}

export function initMState(graph: Graph, startNode: string) {
  const m: Record<string, number> = {};
  for (const node of graph.nodes) m[node.id] = 2;
  m[startNode] = 1;
  return m;
}

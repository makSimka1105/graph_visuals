import type { Graph } from "@/types/graph";

const SCALE = 0.01;

function getPosMap(graph: Graph): Record<string, { x: number; y: number }> {
  const map: Record<string, { x: number; y: number }> = {};
  for (const n of graph.nodes) map[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
  return map;
}

export function getHeuristic(
  graph: Graph,
  endNodeId: string
): (nodeId: string) => number {
  const posMap = getPosMap(graph);
  const goal = posMap[endNodeId] ?? { x: 0, y: 0 };
  return (nodeId) => {
    const a = posMap[nodeId] ?? { x: 0, y: 0 };
    const raw = Math.sqrt((a.x - goal.x) ** 2 + (a.y - goal.y) ** 2) * SCALE;
    return Math.floor(raw * 10); // integer: multiply by 10, drop fractional
  };
}

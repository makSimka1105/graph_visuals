import type { Graph, HeuristicType } from "@/types/graph";
export type { HeuristicType } from "@/types/graph";

const SCALE = 0.01;

function getPosMap(graph: Graph): Record<string, { x: number; y: number }> {
  const map: Record<string, { x: number; y: number }> = {};
  for (const n of graph.nodes) map[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
  return map;
}

function toDisplay(val: number): number {
  return Math.floor(val * 10);
}

export function getHeuristic(
  graph: Graph,
  endNodeId: string,
  type?: HeuristicType
): (nodeId: string) => number {
  const heuristicType = type ?? graph.heuristicType ?? "euclidean";
  const posMap = getPosMap(graph);
  const goal = posMap[endNodeId] ?? { x: 0, y: 0 };

  if (heuristicType === "zero") {
    return () => 0;
  }

  return (nodeId) => {
    const a = posMap[nodeId] ?? { x: 0, y: 0 };
    const dx = Math.abs(a.x - goal.x);
    const dy = Math.abs(a.y - goal.y);
    let raw: number;
    if (heuristicType === "manhattan") {
      raw = (dx + dy) * SCALE;
    } else {
      raw = Math.sqrt((a.x - goal.x) ** 2 + (a.y - goal.y) ** 2) * SCALE;
    }
    return toDisplay(raw);
  };
}

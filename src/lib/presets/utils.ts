import type { GraphNode, GraphEdge } from "@/types/graph";

export function n(id: number | string, x: number, y: number): GraphNode {
  return { id: String(id), label: String(id), x, y };
}

export function e(s: number | string, t: number | string, w = 1): GraphEdge {
  return { id: `e${s}-${t}`, source: String(s), target: String(t), weight: w };
}

export function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

import type { Graph } from "@/types/graph";

export interface FloydMatrixResult {
  dist: number[][];
  next: (number | null)[][];
  nodeIds: string[];
  idxMap: Map<string, number>;
  edgeIdMap: Map<string, string>;
}

export function buildFloydWarshallMatrix(graph: Graph): FloydMatrixResult {
  const nodeIds = graph.nodes.map((n) => n.id);
  const n = nodeIds.length;
  const idxMap = new Map<string, number>();
  nodeIds.forEach((id, i) => idxMap.set(id, i));

  const dist: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  const next: (number | null)[][] = Array.from({ length: n }, () => Array(n).fill(null));

  for (let i = 0; i < n; i++) dist[i][i] = 0;

  const edgeIdMap = new Map<string, string>();
  for (const edge of graph.edges) {
    const si = idxMap.get(edge.source);
    const ti = idxMap.get(edge.target);
    if (si === undefined || ti === undefined) continue;
    const w = graph.weighted ? (edge.weight ?? 1) : 1;
    if (w < dist[si][ti]) {
      dist[si][ti] = w;
      next[si][ti] = ti;
      edgeIdMap.set(`${si}-${ti}`, edge.id);
    }
    if (!graph.directed && w < dist[ti][si]) {
      dist[ti][si] = w;
      next[ti][si] = si;
      edgeIdMap.set(`${ti}-${si}`, edge.id);
    }
  }

  return { dist, next, nodeIds, idxMap, edgeIdMap };
}

export function matrixRowToRecord(
  dist: number[][],
  nodeIds: string[],
  rowIdx: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (let j = 0; j < nodeIds.length; j++) {
    result[nodeIds[j]] = dist[rowIdx]?.[j] ?? Infinity;
  }
  return result;
}

export function reconstructPathFromMatrix(
  next: (number | null)[][],
  edgeIdMap: Map<string, string>,
  startIdx: number,
  endIdx: number,
  nodeIds: string[]
): { nodes: string[]; edges: string[] } | null {
  const pathNodes: string[] = [];
  const pathEdges: string[] = [];
  let cur = startIdx;
  pathNodes.push(nodeIds[cur]);
  const n = nodeIds.length;

  while (cur !== endIdx) {
    if (pathNodes.length >= n) return null;
    const nxt = next[cur][endIdx];
    if (nxt === null) break;
    const eId = edgeIdMap.get(`${cur}-${nxt}`);
    if (eId) pathEdges.push(eId);
    cur = nxt;
    pathNodes.push(nodeIds[cur]);
  }

  return { nodes: pathNodes, edges: pathEdges };
}

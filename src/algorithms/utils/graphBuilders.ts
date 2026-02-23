import type { Graph } from "@/types/graph";

export type AdjEdgeUnweighted = { nodeId: string; edgeId: string };
export type AdjEdgeWeighted = { nodeId: string; edgeId: string; weight: number };

export function buildAdjList(graph: Graph): Record<string, AdjEdgeUnweighted[]>;
export function buildAdjList(
  graph: Graph,
  weighted: true
): Record<string, AdjEdgeWeighted[]>;

export function buildAdjList(
  graph: Graph,
  weighted?: boolean
): Record<string, AdjEdgeUnweighted[] | AdjEdgeWeighted[]> {
  const adj: Record<string, (AdjEdgeUnweighted | AdjEdgeWeighted)[]> = {};
  const nodeIdSet = new Set(graph.nodes.map((n) => n.id));

  for (const node of graph.nodes) adj[node.id] = [];

  for (const edge of graph.edges) {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;

    const weight = edge.weight ?? 1;
    const edgeOut = weighted
      ? { nodeId: edge.target, edgeId: edge.id, weight }
      : { nodeId: edge.target, edgeId: edge.id };
    adj[edge.source].push(edgeOut);

    if (!graph.directed) {
      const edgeBack = weighted
        ? { nodeId: edge.source, edgeId: edge.id, weight }
        : { nodeId: edge.source, edgeId: edge.id };
      adj[edge.target].push(edgeBack);
    }
  }

  return adj as Record<string, AdjEdgeUnweighted[] | AdjEdgeWeighted[]>;
}

export function buildReverseAdjList(graph: Graph): Record<string, AdjEdgeUnweighted[]>;
export function buildReverseAdjList(
  graph: Graph,
  weighted: true
): Record<string, AdjEdgeWeighted[]>;
export function buildReverseAdjList(
  graph: Graph,
  weighted?: boolean
): Record<string, AdjEdgeUnweighted[] | AdjEdgeWeighted[]> {
  if (!graph.directed) {
    return (weighted ? buildAdjList(graph, true) : buildAdjList(graph)) as Record<string, AdjEdgeUnweighted[] | AdjEdgeWeighted[]>;
  }
  const adj: Record<string, (AdjEdgeUnweighted | AdjEdgeWeighted)[]> = {};
  const nodeIdSet = new Set(graph.nodes.map((n) => n.id));
  for (const node of graph.nodes) adj[node.id] = [];
  for (const edge of graph.edges) {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
    const weight = edge.weight ?? 1;
    const edgeIn = weighted
      ? { nodeId: edge.source, edgeId: edge.id, weight }
      : { nodeId: edge.source, edgeId: edge.id };
    adj[edge.target].push(edgeIn);
  }
  return adj as Record<string, AdjEdgeUnweighted[] | AdjEdgeWeighted[]>;
}

export type AllEdge = { source: string; target: string; edgeId: string; weight: number };

export function buildAllEdges(graph: Graph): AllEdge[] {
  const nodeIdSet = new Set(graph.nodes.map((n) => n.id));
  const weight = (e: { weight?: number }) => (graph.weighted ? (e.weight ?? 1) : 1);

  const result: AllEdge[] = [];
  for (const edge of graph.edges) {
    if (!nodeIdSet.has(edge.source) || !nodeIdSet.has(edge.target)) continue;
    const w = weight(edge);
    result.push({ source: edge.source, target: edge.target, edgeId: edge.id, weight: w });
    if (!graph.directed) {
      result.push({ source: edge.target, target: edge.source, edgeId: edge.id, weight: w });
    }
  }
  return result;
}

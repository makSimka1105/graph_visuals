import type { GraphNode, GraphEdge, AlgorithmDefinition } from "@/types/graph";

export type WarningSeverity = "error" | "warning" | "info";

export interface GraphWarning {
  severity: WarningSeverity;
  message: string;
}

function hasCycles(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed: boolean,
): boolean {
  const adj = new Map<string, { nodeId: string; edgeId: string }[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.source)?.push({ nodeId: e.target, edgeId: e.id });
    if (!directed) {
      adj.get(e.target)?.push({ nodeId: e.source, edgeId: e.id });
    }
  }

  if (directed) {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = new Map<string, number>();
    for (const n of nodes) color.set(n.id, WHITE);

    function dfs(u: string): boolean {
      color.set(u, GRAY);
      for (const { nodeId: v } of adj.get(u)!) {
        if (color.get(v) === GRAY) return true;
        if (color.get(v) === WHITE && dfs(v)) return true;
      }
      color.set(u, BLACK);
      return false;
    }

    for (const n of nodes) {
      if (color.get(n.id) === WHITE && dfs(n.id)) return true;
    }
    return false;
  } else {
    const visited = new Set<string>();

    function dfs(u: string, parentEdge: string | null): boolean {
      visited.add(u);
      for (const { nodeId: v, edgeId } of adj.get(u)!) {
        if (edgeId === parentEdge) continue;
        if (visited.has(v)) return true;
        if (dfs(v, edgeId)) return true;
      }
      return false;
    }

    for (const n of nodes) {
      if (!visited.has(n.id) && dfs(n.id, null)) return true;
    }
    return false;
  }
}

export function hasNegativeWeights(edges: GraphEdge[]): boolean {
  return edges.some((e) => (e.weight ?? 1) < 0);
}

function isConnected(nodes: GraphNode[], edges: GraphEdge[], directed: boolean): boolean {
  if (nodes.length <= 1) return true;
  const adj = new Map<string, string[]>();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.source)?.push(e.target);
    if (!directed) adj.get(e.target)?.push(e.source);
  }
  const visited = new Set<string>();
  function dfs(u: string) {
    visited.add(u);
    for (const v of adj.get(u) ?? []) {
      if (!visited.has(v)) dfs(v);
    }
  }
  dfs(nodes[0].id);
  return visited.size === nodes.length;
}

export function hasNegativeCycle(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed: boolean,
  weighted: boolean,
): boolean {
  if (nodes.length === 0 || edges.length === 0) return false;
  if (!weighted) return false;

  if (!directed) {
    return hasNegativeWeights(edges);
  }

  const nodeIds = new Set(nodes.map((n) => n.id));
  const dist = new Map<string, number>();
  for (const n of nodes) dist.set(n.id, Infinity);
  dist.set("__supersource__", 0);

  const edgeList: { u: string; v: string; w: number }[] = [];
  for (const n of nodes) {
    edgeList.push({ u: "__supersource__", v: n.id, w: 0 });
  }
  for (const e of edges) {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      edgeList.push({ u: e.source, v: e.target, w: e.weight ?? 1 });
    }
  }

  for (let i = 0; i <= nodes.length; i++) {
    let relaxed = false;
    for (const { u, v, w } of edgeList) {
      const du = dist.get(u) ?? Infinity;
      const dv = dist.get(v) ?? Infinity;
      if (du !== Infinity && du + w < dv) {
        dist.set(v, du + w);
        relaxed = true;
      }
    }
    if (i === nodes.length && relaxed) return true;
  }
  return false;
}

export function wouldCreateCycle(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed: boolean,
  source: string,
  target: string,
): boolean {
  const tempEdge: GraphEdge = { id: "__temp__", source, target };
  return hasCycles(nodes, [...edges, tempEdge], directed);
}

export interface CompatibilityResult {
  ok: boolean;
  warnings: GraphWarning[];
}

export function checkCompatibility(
  alg: AlgorithmDefinition,
  graphState: {
    directed: boolean;
    weighted: boolean;
    acyclic: boolean;
    nodes: GraphNode[];
    edges: GraphEdge[];
    heuristicType?: "euclidean" | "manhattan" | "zero";
    startNodeId?: string | null;
    endNodeId?: string | null;
  },
): CompatibilityResult {
  const warnings: GraphWarning[] = [];
  const { nodes, edges, directed, weighted } = graphState;
  const negWeights = hasNegativeWeights(edges);
  const negCycle =
    weighted &&
    edges.length > 0 &&
    hasNegativeCycle(nodes, edges, directed, weighted);

  if (graphState.directed && !alg.supportsDirected) {
    warnings.push({ severity: "error", message: "Does not support directed graphs" });
  }
  if (!graphState.directed && !alg.supportsUndirected) {
    warnings.push({ severity: "error", message: "Does not support undirected graphs" });
  }

  if (alg.requiresStartNode !== false && !graphState.startNodeId && nodes.length > 0) {
    warnings.push({ severity: "error", message: "Select a start node" });
  }
  if (alg.requiresEndNode && !graphState.endNodeId) {
    warnings.push({ severity: "error", message: "Select an end node" });
  }
  if (
    graphState.startNodeId &&
    graphState.endNodeId &&
    graphState.startNodeId === graphState.endNodeId
  ) {
    warnings.push({ severity: "error", message: "Start and end node must be different" });
  }

  if (alg.requiresNonNegativeWeights && weighted && edges.length > 0) {
    if (negWeights) {
      warnings.push({
        severity: "error",
        message: "Graph has negative weights - algorithm requires non-negative weights",
      });
    }
    if (negCycle) {
      warnings.push({
        severity: "error",
        message: "Graph contains a negative cycle - cannot run this algorithm",
      });
    }
  }

  if (graphState.weighted && !alg.supportsWeighted) {
    warnings.push({ severity: "info", message: "Edge weights will be ignored" });
  }
  if (!graphState.weighted && alg.supportsWeighted) {
    warnings.push({ severity: "info", message: "Graph is unweighted, all edges treated as weight 1" });
  }

  if (alg.id === "dfs") {
    warnings.push({ severity: "info", message: "DFS does not guarantee shortest path" });
  }
  if (
    (alg.id === "astar" || alg.id === "greedy-bfs" || alg.id === "bidirectional-astar") &&
    (graphState.heuristicType ?? "euclidean") === "zero"
  ) {
    warnings.push({
      severity: "info",
      message: "With zero heuristic, the algorithm is equivalent to Dijkstra",
    });
  }
  if (alg.id === "kosaraju") {
    warnings.push({
      severity: "info",
      message: "In Kosaraju, displayed values are exit indices (post-order), not distances",
    });
    warnings.push({
      severity: "info",
      message: "Only up to 30 strongly connected components are supported with distinct colors",
    });
  }
  if (alg.category === "mst") {
    warnings.push({
      severity: "info",
      message: "MST: gray = not in tree, green = in minimum spanning tree",
    });
    if (nodes.length > 1 && edges.length > 0 && !isConnected(nodes, edges, directed)) {
      warnings.push({
        severity: "info",
        message: "Graph is disconnected; result will be a spanning forest",
      });
    }
  }

  if ((alg.id === "levit" || alg.id === "desopo-pape") && weighted && edges.length > 0) {
    if (negCycle) {
      warnings.push({
        severity: "warning",
        message: "Negative cycle detected - algorithm may abort without finding paths",
      });
    } else if (negWeights) {
      warnings.push({
        severity: "info",
        message: "With negative weights: algorithm may abort if a negative cycle is reachable",
      });
    }
  }

  const hasErrors = warnings.some((w) => w.severity === "error");
  return { ok: !hasErrors, warnings };
}

export function getGraphWarnings(
  nodes: GraphNode[],
  edges: GraphEdge[],
  directed: boolean,
  acyclic: boolean,
  weighted?: boolean,
  selectedAlgorithm?: AlgorithmDefinition | null,
): GraphWarning[] {
  if (nodes.length === 0) return [];

  const warnings: GraphWarning[] = [];
  const negWeights = hasNegativeWeights(edges);
  const skipNegWeightsInfo =
    selectedAlgorithm?.requiresNonNegativeWeights && negWeights;

  if (acyclic && edges.length > 0 && hasCycles(nodes, edges, directed)) {
    warnings.push({
      severity: "warning",
      message: "Acyclic mode is on, but graph contains cycles",
    });
  }

  if (negWeights && !skipNegWeightsInfo) {
    warnings.push({
      severity: "info",
      message: "Graph has negative edge weights",
    });
  }

  if (weighted && edges.length > 0 && hasNegativeCycle(nodes, edges, directed, weighted)) {
    if (!directed) {
      warnings.push({
        severity: "warning",
        message: "Undirected graph with negative edge: any such edge creates a negative cycle (a - > b - > a). Shortest paths are undefined.",
      });
    } else {
      warnings.push({
        severity: "warning",
        message: "Graph contains a negative cycle - shortest path algorithms may fail or give incorrect results",
      });
    }
  }

  return warnings;
}

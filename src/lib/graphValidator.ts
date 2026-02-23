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

function hasNegativeWeights(edges: GraphEdge[]): boolean {
  return edges.some((e) => (e.weight ?? 1) < 0);
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
  },
): CompatibilityResult {
  const warnings: GraphWarning[] = [];

  if (graphState.directed && !alg.supportsDirected) {
    warnings.push({ severity: "error", message: "Does not support directed graphs" });
  }
  if (!graphState.directed && !alg.supportsUndirected) {
    warnings.push({ severity: "error", message: "Does not support undirected graphs" });
  }

  if (graphState.weighted && !alg.supportsWeighted) {
    warnings.push({ severity: "info", message: "Edge weights will be ignored" });
  }
  if (!graphState.weighted && alg.supportsWeighted) {
    warnings.push({ severity: "info", message: "Graph is unweighted, all edges treated as weight 1" });
  }

  if (alg.requiresNonNegativeWeights && graphState.weighted && graphState.edges.length > 0) {
    if (hasNegativeWeights(graphState.edges)) {
      warnings.push({ severity: "warning", message: "Graph has negative weights, may produce incorrect results" });
    }
  }

  if (alg.id === "dfs") {
    warnings.push({ severity: "info", message: "DFS does not guarantee shortest path" });
  }
  if ((alg.id === "levit" || alg.id === "desopo-pape") && graphState.weighted && graphState.edges.length > 0) {
    if (hasNegativeWeights(graphState.edges)) {
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
): GraphWarning[] {
  if (nodes.length === 0) return [];

  const warnings: GraphWarning[] = [];

  if (acyclic && edges.length > 0 && hasCycles(nodes, edges, directed)) {
    warnings.push({
      severity: "warning",
      message: "Acyclic mode is on, but graph contains cycles",
    });
  }

  if (hasNegativeWeights(edges)) {
    warnings.push({
      severity: "info",
      message: "Graph has negative edge weights",
    });
  }

  return warnings;
}

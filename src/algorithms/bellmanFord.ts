import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import { buildAllEdges, createStepRecorder, reconstructPath, initDistPrev, applyPathToStates } from "./utils";
import { registerAlgorithm } from "./registry";

function bellmanFordRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const allEdges = buildAllEdges(graph);
  const steps: AlgorithmStep[] = [];
  const { dist, prev } = initDistPrev(graph, startNode);
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist });

  nodeStates[startNode] = "current";
  pushStep(`Initialize Bellman-Ford from ${startNode}. Distance = 0.`);
  nodeStates[startNode] = "visited";

  const n = graph.nodes.length;
  for (let iteration = 0; iteration < n - 1; iteration++) {
    let updated = false;
    pushStep(`Iteration ${iteration + 1} of ${n - 1}. Relaxing all edges.`);

    for (const { source, target, edgeId, weight } of allEdges) {
      const srcDist = dist[source] ?? Infinity;
      if (srcDist === Infinity) continue;

      const newDist = srcDist + weight;
      if (newDist < (dist[target] ?? Infinity)) {
        dist[target] = newDist;
        prev[target] = { nodeId: source, edgeId };
        updated = true;
        edgeStates[edgeId] = "current";
        nodeStates[target] = "current";
        pushStep(`Relax ${source} -> ${target} (weight ${weight}). New distance: ${newDist}.`);
        edgeStates[edgeId] = "traversed";
        nodeStates[target] = "visited";
      }
    }

    if (!updated) {
      pushStep(`No updates in iteration ${iteration + 1}. Early termination.`);
      break;
    }
  }

  for (const { source, target, weight } of allEdges) {
    const srcDist = dist[source] ?? Infinity;
    if (srcDist === Infinity) continue;
    if (srcDist + weight < (dist[target] ?? Infinity)) {
      pushStep(`Negative weight cycle detected via edge ${source} -> ${target}!`);
      return steps;
    }
  }

  if (endNode) {
    const endDist = dist[endNode] ?? Infinity;
    if (endDist < Infinity) {
      const path = reconstructPath(prev, startNode, endNode);
      if (path) {
        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Shortest path to ${endNode} found! Distance: ${endDist}.`, { data: { pathNodeIds: path.nodes } });
      }
    } else {
      pushStep(`Bellman-Ford complete. Node ${endNode} unreachable.`);
    }
  } else {
    pushStep(`Bellman-Ford complete. All shortest distances computed.`);
  }

  return steps;
}

registerAlgorithm({
  id: "bellman-ford",
  name: "Bellman-Ford",
  description:
    "Bellman-Ford: finds shortest path with negative edge weights. Detects negative cycles. " +
    "Works on directed and undirected. O(V * E).",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: bellmanFordRun,
});

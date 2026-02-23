import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import { buildAdjList, createStepRecorder, reconstructPath, initDistPrev, createPriorityQueue, applyPathToStates, type AdjEdgeWeighted } from "./utils";
import { registerAlgorithm } from "./registry";

function dijkstraRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const { dist, prev } = initDistPrev(graph, startNode);
  const pq = createPriorityQueue();
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};

  pq.addOrUpdate(0, startNode);

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist });

  nodeStates[startNode] = "inQueue";
  pushStep(`Initialize Dijkstra from ${startNode}. Distance = 0.`, {
    auxiliary: {
      queues: [{ items: [startNode], type: "priority", label: "Priority queue", itemsWithDist: [{ dist: 0, nodeId: startNode }] }],
      lastAddedToQueue: startNode,
      lastAddedToQueueIndex: 0,
    },
  });

  for (let i = 0; i < graph.nodes.length; i++) {
    const item = pq.extractMin();
    if (!item) break;

    const { dist: minDist, nodeId: current } = item;
    if (visited.has(current)) continue;

    visited.add(current);
    nodeStates[current] = "current";
    pushStep(`Extract min: ${current} with distance ${minDist}.`, {
      auxiliary: {
        queues: [{ items: pq.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Priority queue", itemsWithDist: pq.toSortedArray() }],
        currentVertex: current,
        extractedInThisStep: true,
        currentVertexQueueIndex: 0,
      },
    });

    if (current === endNode) {
      const path = reconstructPath(prev, startNode, endNode);
      if (path) {
        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Found shortest path to ${endNode}! Total distance: ${minDist}.`, { data: { pathNodeIds: path.nodes } });
      }
      return steps;
    }

    const neighbors = adj[current] ?? [];
    for (const { nodeId, edgeId, weight } of neighbors) {
      if (visited.has(nodeId)) continue;
      const edgeWeight = graph.weighted ? weight : 1;
      const newDist = minDist + edgeWeight;
      if (newDist < (dist[nodeId] ?? Infinity)) {
        dist[nodeId] = newDist;
        prev[nodeId] = { nodeId: current, edgeId };
        pq.addOrUpdate(newDist, nodeId);
        edgeStates[edgeId] = "current";
        nodeStates[nodeId] = "inQueue";
        pushStep(`Relax edge to ${nodeId}${graph.weighted ? ` (weight ${edgeWeight})` : ""}. New distance: ${newDist}.`, {
          auxiliary: {
            queues: [{ items: pq.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Priority queue", itemsWithDist: pq.toSortedArray() }],
            currentVertex: current,
            lastAddedToQueue: nodeId,
            lastAddedToQueueIndex: 0,
          },
        });
        edgeStates[edgeId] = "traversed";
      }
    }

    nodeStates[current] = "visited";
    pushStep(`Finished processing node ${current}.`, {
      auxiliary: {
        queues: [{ items: pq.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Priority queue", itemsWithDist: pq.toSortedArray() }],
        currentVertex: current,
        currentVertexQueueIndex: 0,
      },
    });
  }

  pushStep(endNode ? `Dijkstra complete. Node ${endNode} unreachable.` : `Dijkstra complete. All reachable nodes processed.`);
  return steps;
}

registerAlgorithm({
  id: "dijkstra",
  name: "Dijkstra",
  description:
    "Dijkstra: shortest path with priority queue. Uses edge weights when graph is weighted, " +
    "otherwise treats edges as weight 1. Requires non-negative weights. O((V + E) log V).",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  requiresNonNegativeWeights: true,
  run: dijkstraRun,
});

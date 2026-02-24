import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import {
  buildAdjList,
  createStepRecorder,
  reconstructPath,
  initDistPrev,
  createPriorityQueue,
  getHeuristic,
  roundForDisplay,
  applyPathToStates,
  type AdjEdgeWeighted,
} from "./utils";
import { registerAlgorithm } from "./registry";

function astarRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  if (!endNode) {
    return [{ nodeStates: {}, edgeStates: {}, description: "A* requires an end node to compute heuristic." }];
  }

  const adj = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const { dist: g, prev } = initDistPrev(graph, startNode);
  const h = getHeuristic(graph, endNode);
  const pq = createPriorityQueue();

  pq.addOrUpdate(0 + h(startNode), startNode);

  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist: g });

  nodeStates[startNode] = "inQueue";
  pushStep(`Initialize A* from ${startNode}. g=0, h=${h(startNode)}, f=0+${h(startNode)}.`, {
    auxiliary: {
      queues: [{
        items: [startNode],
        type: "priority",
        label: "PQueue (f,id) f=g+h",
        itemsWithDist: [{ dist: roundForDisplay(0 + h(startNode)), nodeId: startNode }],
      }],
      lastAddedToQueue: startNode,
      lastAddedToQueueIndex: 0,
    },
  });

  for (let i = 0; i < graph.nodes.length; i++) {
    const item = pq.extractMin();
    if (!item) break;

    const { dist: fVal, nodeId: current } = item;
    if (visited.has(current)) continue;

    visited.add(current);
    const gCurrent = g[current] ?? Infinity;
    nodeStates[current] = "current";
    pushStep(`Extract min: ${current} with f=${fVal} (g=${gCurrent}, h=${h(current)}).`, {
      auxiliary: {
        queues: [{
          items: pq.toSortedArray().map((x) => x.nodeId),
          type: "priority",
          label: "PQueue (f,id) f=g+h",
          itemsWithDist: pq.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })),
        }],
        currentVertex: current,
        extractedInThisStep: true,
        currentVertexQueueIndex: 0,
      },
    });

    if (current === endNode) {
      const path = reconstructPath(prev, startNode, endNode);
      if (path) {
        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Found shortest path to ${endNode}! Total distance: ${gCurrent}.`, { data: { pathNodeIds: path.nodes } });
      }
      return steps;
    }

    const neighbors = adj[current] ?? [];
    for (const { nodeId, edgeId, weight } of neighbors) {
      if (visited.has(nodeId)) continue;
      const edgeWeight = graph.weighted ? weight : 1;
      const newG = gCurrent + edgeWeight;
      if (newG < (g[nodeId] ?? Infinity)) {
        g[nodeId] = newG;
        prev[nodeId] = { nodeId: current, edgeId };
        const fNew = newG + h(nodeId);
        pq.addOrUpdate(fNew, nodeId);

        edgeStates[edgeId] = "current";
        nodeStates[nodeId] = "inQueue";
        pushStep(
          `Relax edge to ${nodeId}${graph.weighted ? ` (weight ${edgeWeight})` : ""}. g=${newG}, h=${h(nodeId)}, f=${fNew}.`,
          {
            auxiliary: {
              queues: [{
                items: pq.toSortedArray().map((x) => x.nodeId),
                type: "priority",
                label: "PQueue (f,id) f=g+h",
                itemsWithDist: pq.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })),
              }],
              currentVertex: current,
              lastAddedToQueue: nodeId,
              lastAddedToQueueIndex: 0,
            },
          }
        );
        edgeStates[edgeId] = "traversed";
      }
    }

    nodeStates[current] = "visited";
    pushStep(`Finished processing node ${current}.`, {
      auxiliary: {
        queues: [{
          items: pq.toSortedArray().map((x) => x.nodeId),
          type: "priority",
          label: "PQueue (f,id) f=g+h",
          itemsWithDist: pq.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })),
        }],
        currentVertex: current,
        currentVertexQueueIndex: 0,
      },
    });
  }

  pushStep(`A* complete. Node ${endNode} unreachable.`);
  return steps;
}

registerAlgorithm({
  id: "astar",
  name: "A*",
  description:
    "A*: shortest path with heuristic f=g+h. Uses Euclidean distance from node positions. " +
    "Requires end node. Non-negative weights only.",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: true,
  requiresNonNegativeWeights: true,
  run: astarRun,
});

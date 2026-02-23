import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import {
  buildAdjList,
  buildReverseAdjList,
  createStepRecorder,
  reconstructPath,
  mergeBidirectionalPath,
  initDistPrev,
  createPriorityQueue,
  applyPathToStates,
  type AdjEdgeWeighted,
} from "./utils";
import { registerAlgorithm } from "./registry";

function bidirectionalDijkstraRun(
  graph: Graph,
  startNode: string,
  endNode?: string
): AlgorithmStep[] {
  if (!endNode) {
    return [{
      nodeStates: {},
      edgeStates: {},
      description: "Bidirectional Dijkstra requires an end node.",
    }];
  }

  const adjF = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const adjB = buildReverseAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const steps: AlgorithmStep[] = [];
  const visitedF = new Set<string>();
  const visitedB = new Set<string>();

  const { dist: distF, prev: prevF } = initDistPrev(graph, startNode);
  const { dist: distB, prev: prevB } = initDistPrev(graph, endNode);
  distB[endNode] = 0;
  prevB[endNode] = null;

  const pqF = createPriorityQueue();
  const pqB = createPriorityQueue();
  pqF.addOrUpdate(0, startNode);
  pqB.addOrUpdate(0, endNode);

  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist: distF });

  nodeStates[startNode] = "inQueue";
  nodeStates[endNode] = "inQueueBackward";
  pushStep(`Initialize bidirectional Dijkstra: forward from ${startNode}, backward from ${endNode}.`, {
    auxiliary: {
      queues: [
        { items: pqF.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Forward", itemsWithDist: pqF.toSortedArray() },
        { items: pqB.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Backward", itemsWithDist: pqB.toSortedArray() },
      ],
      lastAddedToQueue: startNode,
      lastAddedToQueueIndex: 0,
    },
  });

  let bestDist = Infinity;
  let meetNode: string | null = null;
  let forward = true;

  const toSorted = () => ({
    queues: [
      { items: pqF.toSortedArray().map((x) => x.nodeId), type: "priority" as const, label: "Forward", itemsWithDist: pqF.toSortedArray() },
      { items: pqB.toSortedArray().map((x) => x.nodeId), type: "priority" as const, label: "Backward", itemsWithDist: pqB.toSortedArray() },
    ],
  });

  for (let i = 0; i < 2 * graph.nodes.length; i++) {
    const topF = pqF.toSortedArray()[0]?.dist ?? Infinity;
    const topB = pqB.toSortedArray()[0]?.dist ?? Infinity;
    if (topF + topB >= bestDist) break;

    if (forward && pqF.toSortedArray().length > 0) {
      const item = pqF.extractMin();
      if (!item) { forward = false; continue; }
      const { dist: minDist, nodeId: current } = item;
      if (visitedF.has(current)) { forward = false; continue; }

      visitedF.add(current);
      nodeStates[current] = "current";
      pushStep(`Forward: expand ${current} (dist=${minDist}).`, {
        auxiliary: { ...toSorted(), currentVertex: current, currentVertexQueueIndex: 0, extractedInThisStep: true },
      });

      if (visitedB.has(current)) {
        const candidate = minDist + (distB[current] ?? Infinity);
        if (candidate < bestDist) {
          bestDist = candidate;
          meetNode = current;
        }
      }

      const neighbors = adjF[current] ?? [];
      for (const { nodeId, edgeId, weight } of neighbors) {
        const edgeWeight = graph.weighted ? weight : 1;
        const newDist = minDist + edgeWeight;
        if (newDist < (distF[nodeId] ?? Infinity)) {
          distF[nodeId] = newDist;
          prevF[nodeId] = { nodeId: current, edgeId };
          pqF.addOrUpdate(newDist, nodeId);
          edgeStates[edgeId] = "current";
          nodeStates[nodeId] = "inQueue";

          if (visitedB.has(nodeId)) {
            const candidate = newDist + (distB[nodeId] ?? Infinity);
            if (candidate < bestDist) {
              bestDist = candidate;
              meetNode = nodeId;
            }
          }

          pushStep(
            `Forward: relax ${current} → ${nodeId}${graph.weighted ? ` (w=${edgeWeight})` : ""}. New dist=${newDist}.`,
            { auxiliary: { ...toSorted(), currentVertex: current, lastAddedToQueue: nodeId, lastAddedToQueueIndex: 0 } }
          );
          edgeStates[edgeId] = "traversed";
        }
      }

      nodeStates[current] = "visited";
    } else if (!forward && pqB.toSortedArray().length > 0) {
      const item = pqB.extractMin();
      if (!item) { forward = true; continue; }
      const { dist: minDist, nodeId: current } = item;
      if (visitedB.has(current)) { forward = true; continue; }

      visitedB.add(current);
      nodeStates[current] = "currentBackward";
      pushStep(`Backward: expand ${current} (dist=${minDist}).`, {
        auxiliary: { ...toSorted(), currentVertex: current, currentVertexQueueIndex: 1, extractedInThisStep: true },
      });

      if (visitedF.has(current)) {
        const candidate = (distF[current] ?? Infinity) + minDist;
        if (candidate < bestDist) {
          bestDist = candidate;
          meetNode = current;
        }
      }

      const neighbors = adjB[current] ?? [];
      for (const { nodeId, edgeId, weight } of neighbors) {
        const edgeWeight = graph.weighted ? weight : 1;
        const newDist = minDist + edgeWeight;
        if (newDist < (distB[nodeId] ?? Infinity)) {
          distB[nodeId] = newDist;
          prevB[nodeId] = { nodeId: current, edgeId };
          pqB.addOrUpdate(newDist, nodeId);
          edgeStates[edgeId] = "currentBackward";
          nodeStates[nodeId] = "inQueueBackward";

          if (visitedF.has(nodeId)) {
            const candidate = (distF[nodeId] ?? Infinity) + newDist;
            if (candidate < bestDist) {
              bestDist = candidate;
              meetNode = nodeId;
            }
          }

          pushStep(
            `Backward: relax ${current} → ${nodeId}${graph.weighted ? ` (w=${edgeWeight})` : ""}. New dist=${newDist}.`,
            { auxiliary: { ...toSorted(), currentVertex: current, lastAddedToQueue: nodeId, lastAddedToQueueIndex: 1 } }
          );
          edgeStates[edgeId] = "traversedBackward";
        }
      }

      nodeStates[current] = "visitedBackward";
    } else {
      forward = !forward;
      if ((forward && pqF.toSortedArray().length === 0) || (!forward && pqB.toSortedArray().length === 0)) break;
      continue;
    }

    forward = !forward;
  }

  if (meetNode !== null && bestDist < Infinity) {
    const pathFromStart = reconstructPath(prevF, startNode, meetNode);
    const pathFromEnd = reconstructPath(prevB, endNode, meetNode);
    if (pathFromStart && pathFromEnd) {
      const fullPath = mergeBidirectionalPath(pathFromStart, pathFromEnd);
      applyPathToStates(fullPath, nodeStates, edgeStates);
      pushStep(`Found shortest path! Distance: ${bestDist}. Frontiers met at ${meetNode}.`, {
        data: { pathNodeIds: fullPath.nodes },
      });
    }
  } else {
    pushStep(`Bidirectional Dijkstra complete. Node ${endNode} unreachable from ${startNode}.`);
  }

  return steps;
}

registerAlgorithm({
  id: "bidirectional-dijkstra",
  name: "Bidirectional Dijkstra",
  description:
    "Bidirectional Dijkstra: runs Dijkstra from both start and end simultaneously. " +
    "Terminates when frontiers meet with proven optimal distance. Typically explores fewer nodes than regular Dijkstra. " +
    "Requires non-negative weights and end node. O((V + E) log V).",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: true,
  requiresNonNegativeWeights: true,
  run: bidirectionalDijkstraRun,
});

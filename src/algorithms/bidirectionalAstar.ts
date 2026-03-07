import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import {
  buildAdjList,
  buildReverseAdjList,
  createStepRecorder,
  reconstructPath,
  mergeBidirectionalPath,
  initDistPrev,
  createPriorityQueue,
  getHeuristic,
  roundForDisplay,
  applyPathToStates,
  type AdjEdgeWeighted,
} from "./utils";
import { registerAlgorithm } from "./registry";

function bidirectionalAstarRun(
  graph: Graph,
  startNode: string,
  endNode?: string
): AlgorithmStep[] {
  if (!endNode) {
    return [{
      nodeStates: {},
      edgeStates: {},
      description: "Bidirectional A* requires an end node.",
    }];
  }

  const adjF = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const adjB = buildReverseAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const steps: AlgorithmStep[] = [];
  const visitedF = new Set<string>();
  const visitedB = new Set<string>();

  const { dist: gF, prev: prevF } = initDistPrev(graph, startNode);
  const { dist: gB, prev: prevB } = initDistPrev(graph, endNode);
  gB[endNode] = 0;
  prevB[endNode] = null;

  const hF = getHeuristic(graph, endNode);
  const hB = getHeuristic(graph, startNode);

  const pqF = createPriorityQueue();
  const pqB = createPriorityQueue();
  pqF.addOrUpdate(0 + hF(startNode), startNode);
  pqB.addOrUpdate(0 + hB(endNode), endNode);

  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist: gF });

  nodeStates[startNode] = "inQueue";
  nodeStates[endNode] = "inQueueBackward";
  pushStep(
    `Initialize bidirectional A*: forward from ${startNode} (f=g+h to end), backward from ${endNode} (f=g+h to start).`,
    {
      auxiliary: {
        queues: [
          { items: pqF.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Forward f=g+h", itemsWithDist: pqF.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })) },
          { items: pqB.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Backward f=g+h", itemsWithDist: pqB.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })) },
        ],
        lastAddedToQueue: startNode,
        lastAddedToQueueIndex: 0,
      },
    }
  );

  let bestDist = Infinity;
  let meetNode: string | null = null;
  let forward = true;

  const toSorted = () => ({
    queues: [
      { items: pqF.toSortedArray().map((x) => x.nodeId), type: "priority" as const, label: "Forward f=g+h", itemsWithDist: pqF.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })) },
      { items: pqB.toSortedArray().map((x) => x.nodeId), type: "priority" as const, label: "Backward f=g+h", itemsWithDist: pqB.toSortedArray().map((x) => ({ ...x, dist: roundForDisplay(x.dist) })) },
    ],
  });

  for (let i = 0; i < 2 * graph.nodes.length; i++) {
    const topF = pqF.toSortedArray()[0]?.dist ?? Infinity;
    const topB = pqB.toSortedArray()[0]?.dist ?? Infinity;
    if (topF + topB >= bestDist) break;

    if (forward && pqF.toSortedArray().length > 0) {
      const item = pqF.extractMin();
      if (!item) { forward = false; continue; }
      const { dist: fVal, nodeId: current } = item;
      if (visitedF.has(current)) { forward = false; continue; }

      visitedF.add(current);
      const gCurrent = gF[current] ?? Infinity;
      nodeStates[current] = "current";
      pushStep(
        `Forward: expand ${current} (g=${gCurrent}, h=${hF(current)}, f=${fVal}).`,
        { auxiliary: { ...toSorted(), currentVertex: current, currentVertexQueueIndex: 0, extractedInThisStep: true } }
      );

      if (visitedB.has(current)) {
        const candidate = gCurrent + (gB[current] ?? Infinity);
        if (candidate < bestDist) {
          bestDist = candidate;
          meetNode = current;
        }
      }

      const neighbors = adjF[current] ?? [];
      for (const { nodeId, edgeId, weight } of neighbors) {
        const edgeWeight = graph.weighted ? weight : 1;
        const newG = gCurrent + edgeWeight;
        if (newG < (gF[nodeId] ?? Infinity)) {
          gF[nodeId] = newG;
          prevF[nodeId] = { nodeId: current, edgeId };
          const fNew = newG + hF(nodeId);
          pqF.addOrUpdate(fNew, nodeId);
          edgeStates[edgeId] = "current";
          nodeStates[nodeId] = "inQueue";

          if (visitedB.has(nodeId)) {
            const candidate = newG + (gB[nodeId] ?? Infinity);
            if (candidate < bestDist) {
              bestDist = candidate;
              meetNode = nodeId;
            }
          }

          pushStep(
            `Forward: relax ${current} - > ${nodeId}${graph.weighted ? ` (w=${edgeWeight})` : ""}. g=${newG}, f=${fNew}.`,
            { auxiliary: { ...toSorted(), currentVertex: current, lastAddedToQueue: nodeId, lastAddedToQueueIndex: 0 } }
          );
          edgeStates[edgeId] = "traversed";
        }
      }

      nodeStates[current] = "visited";
    } else if (!forward && pqB.toSortedArray().length > 0) {
      const item = pqB.extractMin();
      if (!item) { forward = true; continue; }
      const { dist: fVal, nodeId: current } = item;
      if (visitedB.has(current)) { forward = true; continue; }

      visitedB.add(current);
      const gCurrent = gB[current] ?? Infinity;
      nodeStates[current] = "currentBackward";
      pushStep(
        `Backward: expand ${current} (g=${gCurrent}, h=${hB(current)}, f=${fVal}).`,
        { auxiliary: { ...toSorted(), currentVertex: current, currentVertexQueueIndex: 1, extractedInThisStep: true } }
      );

      if (visitedF.has(current)) {
        const candidate = (gF[current] ?? Infinity) + gCurrent;
        if (candidate < bestDist) {
          bestDist = candidate;
          meetNode = current;
        }
      }

      const neighbors = adjB[current] ?? [];
      for (const { nodeId, edgeId, weight } of neighbors) {
        const edgeWeight = graph.weighted ? weight : 1;
        const newG = gCurrent + edgeWeight;
        if (newG < (gB[nodeId] ?? Infinity)) {
          gB[nodeId] = newG;
          prevB[nodeId] = { nodeId: current, edgeId };
          const fNew = newG + hB(nodeId);
          pqB.addOrUpdate(fNew, nodeId);
          edgeStates[edgeId] = "currentBackward";
          nodeStates[nodeId] = "inQueueBackward";

          if (visitedF.has(nodeId)) {
            const candidate = (gF[nodeId] ?? Infinity) + newG;
            if (candidate < bestDist) {
              bestDist = candidate;
              meetNode = nodeId;
            }
          }

          pushStep(
            `Backward: relax ${current} - > ${nodeId}${graph.weighted ? ` (w=${edgeWeight})` : ""}. g=${newG}, f=${fNew}.`,
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
      pushStep(`Found shortest path! Distance: ${roundForDisplay(bestDist)}. Frontiers met at ${meetNode}.`, {
        data: { pathNodeIds: fullPath.nodes },
      });
    }
  } else {
    pushStep(`Bidirectional A* complete. Node ${endNode} unreachable from ${startNode}.`);
  }

  return steps;
}

registerAlgorithm({
  id: "bidirectional-astar",
  name: "Bidirectional A*",
  description:
    "Bidirectional A*: runs A* from both start and end with Euclidean heuristic. " +
    "Typically explores fewer nodes than unidirectional A*. Requires non-negative weights and end node. Time O((V + E) log V), space O(V).",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: true,
  requiresNonNegativeWeights: true,
  run: bidirectionalAstarRun,
});

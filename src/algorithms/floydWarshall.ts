import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import {
  buildFloydWarshallMatrix,
  createStepRecorder,
  matrixRowToRecord,
  reconstructPathFromMatrix,
  applyPathToStates,
} from "./utils";
import { registerAlgorithm } from "./registry";

function floydWarshallRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const { dist, next, nodeIds, idxMap, edgeIdMap } = buildFloydWarshallMatrix(graph);
  const n = nodeIds.length;
  const si = idxMap.get(startNode)!;

  const steps: AlgorithmStep[] = [];
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const distRecord: Record<string, number> = {};
  const updateDistFromMatrix = () => Object.assign(distRecord, matrixRowToRecord(dist, nodeIds, si));

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist: distRecord });

  updateDistFromMatrix();
  pushStep(`Floyd-Warshall initialized. ${n} nodes, processing ${n} intermediate vertices.`);

  for (let k = 0; k < n; k++) {
    const kId = nodeIds[k];
    nodeStates[kId] = "current";
    updateDistFromMatrix();
    pushStep(`Intermediate vertex k = ${kId} (${k + 1}/${n}).`);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const sum = dist[i][k] + dist[k][j];
        if (Number.isFinite(sum) && sum < dist[i][j]) {
          dist[i][j] = sum;
          next[i][j] = next[i][k];

          if (nodeIds[i] === startNode && endNode && nodeIds[j] === endNode) {
            const iId = nodeIds[i];
            const jId = nodeIds[j];
            nodeStates[iId] = "inQueue";
            nodeStates[jId] = "inQueue";
            updateDistFromMatrix();
            pushStep(`Update dist(${iId}, ${jId}) = ${dist[i][j]} via ${kId}.`);
            nodeStates[iId] = "default";
            nodeStates[jId] = "default";
          }
        }
      }
    }

    nodeStates[kId] = "visited";
  }

  updateDistFromMatrix();

  const hasNegativeCycle = nodeIds.some((_, i) => dist[i][i] < 0);
  if (hasNegativeCycle) {
    pushStep(`Floyd-Warshall: negative cycle detected. Shortest paths undefined.`);
    return steps;
  }

  if (endNode) {
    const ei = idxMap.get(endNode)!;
    const totalDist = dist[si][ei];

    if (totalDist === Infinity) {
      pushStep(`Floyd-Warshall complete. ${endNode} unreachable from ${startNode}.`);
    } else {
      const path = reconstructPathFromMatrix(next, edgeIdMap, si, ei, nodeIds);
      if (path) {
        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Shortest path ${startNode} -> ${endNode}: distance ${totalDist}.`, {
          data: { pathNodeIds: path.nodes },
        });
      } else {
        pushStep(`Shortest path ${startNode} -> ${endNode}: distance ${totalDist} (path reconstruction failed).`);
      }
    }
  } else {
    pushStep(`Floyd-Warshall complete. All-pairs shortest paths computed.`);
  }

  return steps;
}

registerAlgorithm({
  id: "floyd-warshall",
  name: "Floyd-Warshall",
  description:
    "Floyd-Warshall: computes shortest paths between ALL pairs. Handles negative weights " +
    "(undefined with negative cycles). O(V³).",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: floydWarshallRun,
});

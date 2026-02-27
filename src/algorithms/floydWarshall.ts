import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import {
  buildFloydWarshallMatrix,
  createStepRecorder,
  matrixRowToRecord,
  reconstructPathFromMatrix,
  applyPathToStates,
} from "./utils";
import { registerAlgorithm } from "./registry";

function copyMatrix(m: number[][]): number[][] {
  return m.map((row) => [...row]);
}

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
  pushStep(`Floyd-Warshall initialized. ${n} nodes, processing ${n} intermediate vertices.`, {
    data: {
      floydMatrix: {
        matrix: copyMatrix(dist),
        nodeIds,
        phaseIndex: -1,
        updatedInPhase: [],
      },
    },
  });

  for (let k = 0; k < n; k++) {
    const kId = nodeIds[k];
    nodeStates[kId] = "current";
    updateDistFromMatrix();
    const updatedInPhase: string[] = [];
    pushStep(`Intermediate vertex k = ${kId} (${k + 1}/${n}). Checking paths via ${kId}.`, {
      data: {
        floydMatrix: {
          matrix: copyMatrix(dist),
          nodeIds,
          phaseIndex: k,
          updatedInPhase: [],
        },
      },
    });

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const sum = dist[i][k] + dist[k][j];
        if (Number.isFinite(sum) && sum < dist[i][j]) {
          const oldDist = dist[i][j];
          dist[i][j] = sum;
          next[i][j] = next[i][k];
          updatedInPhase.push(`${i},${j}`);

          const iId = nodeIds[i];
          const jId = nodeIds[j];
          const dIk = dist[i][k];
          const dKj = dist[k][j];
          nodeStates[kId] = "current";
          nodeStates[jId] = "inQueue";
          updateDistFromMatrix();
          pushStep(
            `dist(${iId},${jId}) = dist(${iId},${kId}) + dist(${kId},${jId}) = ${dIk} + ${dKj} = ${sum} (was ${oldDist})`,
            {
              data: {
                floydMatrix: {
                  matrix: copyMatrix(dist),
                  nodeIds,
                  phaseIndex: k,
                  updatedInPhase: [...updatedInPhase],
                },
              },
            }
          );
          nodeStates[jId] = "default";
        }
      }
    }

    nodeStates[kId] = "visited";
  }

  updateDistFromMatrix();

  const hasNegativeCycle = nodeIds.some((_, i) => dist[i][i] < 0);
  if (hasNegativeCycle) {
    pushStep(`Floyd-Warshall: negative cycle detected. Shortest paths undefined.`, {
      data: {
        floydMatrix: {
          matrix: copyMatrix(dist),
          nodeIds,
          phaseIndex: n - 1,
          updatedInPhase: [],
        },
      },
    });
    return steps;
  }

  if (endNode) {
    const ei = idxMap.get(endNode)!;
    const totalDist = dist[si][ei];

    const finalMatrixData = {
      floydMatrix: {
        matrix: copyMatrix(dist),
        nodeIds,
        phaseIndex: n - 1,
        updatedInPhase: [],
      },
    };
    if (totalDist === Infinity) {
      pushStep(`Floyd-Warshall complete. ${endNode} unreachable from ${startNode}.`, {
        data: finalMatrixData,
      });
    } else {
      const path = reconstructPathFromMatrix(next, edgeIdMap, si, ei, nodeIds);
      if (path) {
        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Shortest path ${startNode} -> ${endNode}: distance ${totalDist}.`, {
          data: { ...finalMatrixData, pathNodeIds: path.nodes },
        });
      } else {
        pushStep(`Shortest path ${startNode} -> ${endNode}: distance ${totalDist} (path reconstruction failed).`, {
          data: finalMatrixData,
        });
      }
    }
  } else {
    pushStep(`Floyd-Warshall complete. All-pairs shortest paths computed.`, {
      data: {
        floydMatrix: {
          matrix: copyMatrix(dist),
          nodeIds,
          phaseIndex: n - 1,
          updatedInPhase: [],
        },
      },
    });
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

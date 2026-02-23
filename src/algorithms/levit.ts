import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import { buildAdjList, createStepRecorder, reconstructPath, initDistPrev, initMState, applyPathToStates, type AdjEdgeWeighted } from "./utils";
import { registerAlgorithm } from "./registry";

function levitRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const steps: AlgorithmStep[] = [];
  const { dist, prev } = initDistPrev(graph, startNode);
  const m = initMState(graph, startNode);
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const urgent: string[] = [];
  const normal: string[] = [startNode];

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist });

  const buildAuxiliary = (extra?: {
    currentVertex?: string;
    lastAddedToQueue?: string;
    lastAddedToQueueIndex?: number;
    extractedInThisStep?: boolean;
    currentVertexQueueIndex?: number;
  }) => ({
    queues: [
      { items: [...urgent], type: "queue" as const, label: "Urgent" },
      { items: [...normal], type: "queue" as const, label: "Normal" },
    ],
    ...extra,
  });

  nodeStates[startNode] = "inQueue";
  pushStep(`Initialize Levit from ${startNode}. dist[${startNode}] = 0. Normal: [${startNode}].`, {
    auxiliary: buildAuxiliary({ currentVertex: startNode, lastAddedToQueue: startNode, lastAddedToQueueIndex: 1 }),
  });

  const maxIterations = graph.nodes.length * graph.edges.length * 2 + graph.nodes.length;
  let iterations = 0;

  while (urgent.length > 0 || normal.length > 0) {
    if (++iterations > maxIterations) {
      pushStep("Possible negative weight cycle detected. Levit aborted.");
      return steps;
    }

    const isUrgent = urgent.length > 0;
    const u = isUrgent ? urgent.shift()! : normal.shift()!;
    m[u] = 0;

    const neighbors = adj[u] ?? [];
    nodeStates[u] = "current";
    pushStep(`Extract ${u} from ${isUrgent ? "urgent" : "normal"} queue (dist=${dist[u]}). Move to M0 (processed).`, {
      auxiliary: buildAuxiliary({ currentVertex: u, extractedInThisStep: true, currentVertexQueueIndex: isUrgent ? 0 : 1 }),
    });

    for (const { nodeId: v, edgeId, weight } of neighbors) {
      const distV = dist[v] ?? Infinity;
      const newDist = dist[u] + weight;
      if (newDist < distV) {
        dist[v] = newDist;
        prev[v] = { nodeId: u, edgeId };
        const setV = m[v] ?? 2;
        edgeStates[edgeId] = "current";

        if (setV === 2) {
          m[v] = 1;
          normal.push(v);
          nodeStates[v] = "inQueue";
          pushStep(`${u} -> ${v} (w=${weight}): first visit, dist=${newDist}. Add to normal queue (M2->M1).`, {
            auxiliary: buildAuxiliary({ currentVertex: u, lastAddedToQueue: v, lastAddedToQueueIndex: 1 }),
          });
        } else if (setV === 0) {
          m[v] = 1;
          urgent.push(v);
          nodeStates[v] = "inQueue";
          pushStep(`${u} -> ${v} (w=${weight}): re-relaxed, dist=${newDist}. Add to urgent queue (M0->M1).`, {
            auxiliary: buildAuxiliary({ currentVertex: u, lastAddedToQueue: v, lastAddedToQueueIndex: 0 }),
          });
        } else {
          pushStep(`${u} -> ${v} (w=${weight}): update dist=${newDist}. Already queued (M1).`, {
            auxiliary: buildAuxiliary({ currentVertex: u }),
          });
        }
        edgeStates[edgeId] = "traversed";
      }
    }

    if (nodeStates[u] === "current") nodeStates[u] = "visited";
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
      pushStep(`Levit complete. Node ${endNode} unreachable.`);
    }
  } else {
    pushStep(`Levit complete. All shortest distances computed.`);
  }

  return steps;
}

registerAlgorithm({
  id: "levit",
  name: "Levit",
  description:
    "Levit: dual-queue modification of D'Esopo-Pape. Splits work into urgent (re-relaxed, processed first) " +
    "and normal (new discoveries). Handles negative weights. Aborts on possible negative cycle (iteration limit). " +
    "Works on directed and undirected weighted graphs.",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: levitRun,
});

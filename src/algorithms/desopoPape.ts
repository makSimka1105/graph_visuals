import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState, DequeItemWithSource } from "@/types/graph";
import { buildAdjList, createStepRecorder, reconstructPath, initDistPrev, initMState, applyPathToStates, type AdjEdgeWeighted } from "./utils";
import { registerAlgorithm } from "./registry";

function desopoPapeRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const steps: AlgorithmStep[] = [];
  const { dist, prev } = initDistPrev(graph, startNode);
  const m = initMState(graph, startNode);
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const deque: DequeItemWithSource[] = [{ nodeId: startNode, fromFront: false }];

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist });

  nodeStates[startNode] = "inQueue";
  pushStep(`Initialize D'Esopo-Pape from ${startNode}. dist[${startNode}] = 0. Deque: [${startNode}].`, {
    auxiliary: {
      queues: [{ items: deque.map((x) => x.nodeId), itemsWithSource: [...deque], type: "deque", label: "Deque" }],
      currentVertex: startNode,
      lastAddedToQueue: startNode,
      lastAddedToQueueSide: "right",
    },
  });

  const maxIterations = graph.nodes.length * graph.edges.length * 2 + graph.nodes.length;
  let iterations = 0;

  while (deque.length > 0) {
    if (++iterations > maxIterations) {
      pushStep("Possible negative weight cycle detected. D'Esopo-Pape aborted.");
      return steps;
    }

    const item = deque.shift()!;
    const u = item.nodeId;
    m[u] = 0;

    const neighbors = adj[u] ?? [];
    nodeStates[u] = "current";
    pushStep(`Extract ${u} from deque (dist=${dist[u]}). Move to M0 (processed).`, {
      auxiliary: {
        queues: [{ items: deque.map((x) => x.nodeId), itemsWithSource: [...deque], type: "deque", label: "Deque" }],
        currentVertex: u,
        extractedInThisStep: true,
      },
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
          deque.push({ nodeId: v, fromFront: false });
          nodeStates[v] = "inQueue";
          pushStep(`${u} -> ${v} (w=${weight}): first visit, dist=${newDist}. Push to back of deque (M2->M1).`, {
            auxiliary: {
              queues: [{ items: deque.map((x) => x.nodeId), itemsWithSource: [...deque], type: "deque", label: "Deque" }],
              currentVertex: u,
              lastAddedToQueue: v,
              lastAddedToQueueSide: "right",
            },
          });
        } else if (setV === 0) {
          m[v] = 1;
          deque.unshift({ nodeId: v, fromFront: true });
          nodeStates[v] = "inQueue";
          pushStep(`${u} -> ${v} (w=${weight}): re-relaxed, dist=${newDist}. Push to front of deque (M0->M1).`, {
            auxiliary: {
              queues: [{ items: deque.map((x) => x.nodeId), itemsWithSource: [...deque], type: "deque", label: "Deque" }],
              currentVertex: u,
              lastAddedToQueue: v,
              lastAddedToQueueSide: "left",
            },
          });
        } else {
          pushStep(`${u} -> ${v} (w=${weight}): update dist=${newDist}. Already in deque (M1).`, {
            auxiliary: {
              queues: [{ items: deque.map((x) => x.nodeId), itemsWithSource: [...deque], type: "deque", label: "Deque" }],
              currentVertex: u,
            },
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
      pushStep(`D'Esopo-Pape complete. Node ${endNode} unreachable.`);
    }
  } else {
    pushStep(`D'Esopo-Pape complete. All shortest distances computed.`);
  }

  return steps;
}

registerAlgorithm({
  id: "desopo-pape",
  name: "D'Esopo-Pape",
  description:
    "D'Esopo-Pape: deque-based SSSP using M0/M1/M2 vertex classification. " +
    "Handles negative weights. Aborts on possible negative cycle (iteration limit). " +
    "Average case faster than Dijkstra and Bellman-Ford, but worst case exponential. " +
    "Works on directed and undirected weighted graphs.",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: desopoPapeRun,
});

import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import { buildAdjList, createStepRecorder, reconstructPath, initDistPrev, applyPathToStates } from "./utils";
import { registerAlgorithm } from "./registry";

function bfsRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph);
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const { dist, prev } = initDistPrev(graph, startNode);
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const queue: string[] = [startNode];
  visited.add(startNode);

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist });

  nodeStates[startNode] = "inQueue";
  pushStep(`Start BFS from node ${startNode}. Add to queue.`, {
    auxiliary: { queues: [{ items: [...queue], label: "queue", type: "queue" }], lastAddedToQueue: startNode },
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentDist = dist[current] ?? 0;

    nodeStates[current] = "current";
    pushStep(`Dequeue node ${current}. Processing neighbors.`, {
      auxiliary: {
        queues: [{ items: [...queue], label: "queue", type: "queue" }],
        currentVertex: current,
        extractedInThisStep: true,
      },
    });

    if (current === endNode) {
      const path = reconstructPath(prev, startNode, endNode);
      if (path) {
        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Found target node ${endNode}! Path length: ${path.nodes.length - 1} edges.`, {
          data: { pathNodeIds: path.nodes },
        });
      }
      return steps;
    }

    const neighbors = adj[current] ?? [];
    for (const { nodeId, edgeId } of neighbors) {
      if (!visited.has(nodeId) && !queue.includes(nodeId)) {
        visited.add(nodeId);
        prev[nodeId] = { nodeId: current, edgeId };
        dist[nodeId] = currentDist + 1;
        queue.push(nodeId);
        edgeStates[edgeId] = "current";
        nodeStates[nodeId] = "inQueue";
        pushStep(`Visit edge to ${nodeId}. Add ${nodeId} to queue.`, {
          auxiliary: {
            queues: [{ items: [...queue], label: "queue", type: "queue" }],
            currentVertex: current,
            lastAddedToQueue: nodeId,
          },
        });
        edgeStates[edgeId] = "traversed";
      }
    }

    nodeStates[current] = "visited";
    pushStep(`Finished processing node ${current}.`, {
      auxiliary: { queues: [{ items: [...queue], label: "queue", type: "queue" }], currentVertex: current },
    });
  }

  pushStep(endNode ? `BFS complete. Node ${endNode} is unreachable from ${startNode}.` : `BFS complete. All reachable nodes visited.`);
  return steps;
}

registerAlgorithm({
  id: "bfs",
  name: "BFS",
  description:
    "Breadth-First Search: explores graph layer by layer. Guarantees shortest path in unweighted graphs. " +
    "Ignores edge weights (treats all as 1). Works on directed and undirected. Time O(V + E), space O(V).",
  category: "shortest-path",
  supportsWeighted: false,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: bfsRun,
});

import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import { buildAdjList, createStepRecorder, reconstructPath, initDistPrev, applyPathToStates } from "./utils";
import { registerAlgorithm } from "./registry";

function dfsRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph);
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const { dist, prev } = initDistPrev(graph, startNode);
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const stack: string[] = [startNode];

  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps, dist });

  nodeStates[startNode] = "inQueue";
  pushStep(`Start DFS from node ${startNode}. Push to stack.`, {
    auxiliary: { queues: [{ items: [...stack], type: "stack" }], lastAddedToQueue: startNode },
  });

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const currentDist = dist[current] ?? 0;

    nodeStates[current] = "current";
    pushStep(`Pop node ${current} from stack. Processing.`, {
      auxiliary: {
        queues: [{ items: [...stack], label: "stack", type: "stack" }],
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
      if (!visited.has(nodeId) && !stack.includes(nodeId)) {
        prev[nodeId] = { nodeId: current, edgeId };
        dist[nodeId] = currentDist + 1;
        stack.push(nodeId);
        edgeStates[edgeId] = "current";
        nodeStates[nodeId] = "inQueue";
        pushStep(`Explore edge to ${nodeId}. Push ${nodeId} to stack.`, {
          auxiliary: { queues: [{ items: [...stack], type: "stack" }], currentVertex: current, lastAddedToQueue: nodeId },
        });
        edgeStates[edgeId] = "traversed";
      }
    }

    nodeStates[current] = "visited";
    pushStep(`Finished processing node ${current}.`, {
      auxiliary: { queues: [{ items: [...stack], type: "stack" }], currentVertex: current },
    });
  }

  pushStep(endNode ? `DFS complete. Node ${endNode} is unreachable from ${startNode}.` : `DFS complete. All reachable nodes visited.`);
  return steps;
}

registerAlgorithm({
  id: "dfs",
  name: "DFS",
  description:
    "Depth-First Search: goes as deep as possible before backtracking. Does NOT guarantee shortest path. " +
    "Ignores edge weights. Works on directed and undirected. Time O(V + E), space O(V).",
  category: "shortest-path",
  supportsWeighted: false,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: dfsRun,
});

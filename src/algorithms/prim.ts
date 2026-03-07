import type {
  Graph,
  AlgorithmStep,
  NodeVisualState,
  EdgeVisualState,
} from "@/types/graph";
import { buildAdjList, createStepRecorder, type AdjEdgeWeighted } from "./utils";
import { createPriorityQueue } from "./utils/priorityQueue";
import { registerAlgorithm } from "./registry";

function primRun(graph: Graph, startNode: string, _endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const nodeIds = graph.nodes.map((n) => n.id);
  const steps: AlgorithmStep[] = [];
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};

  for (const id of nodeIds) nodeStates[id] = "default";
  for (const e of graph.edges) edgeStates[e.id] = "default";

  const setNonTreeEdgesRejected = () => {
    for (const e of graph.edges) {
      if (edgeStates[e.id] !== "inTree") edgeStates[e.id] = "rejected";
    }
  };

  const pushStep = createStepRecorder({
    graph,
    nodeStates,
    edgeStates,
    steps,
  });

  pushStep("Initial state. Graph is gray. We will build minimum spanning tree (MST) by adding edges one by one.");

  const inTree = new Set<string>();
  const dist: Record<string, number> = {};
  const prev: Record<string, { edgeId: string; fromNode: string }> = {};
  for (const id of nodeIds) dist[id] = Infinity;

  inTree.add(startNode);
  nodeStates[startNode] = "inTree";
  pushStep(`Add start node ${startNode} to tree.`, {
    auxiliary: { currentVertex: startNode },
  });

  const pq = createPriorityQueue();
  for (const { nodeId, edgeId, weight } of adj[startNode] ?? []) {
    if (weight < (dist[nodeId] ?? Infinity)) {
      dist[nodeId] = weight;
      prev[nodeId] = { edgeId, fromNode: startNode };
      pq.addOrUpdate(weight, nodeId);
    }
  }

  const getCandidates = () => {
    const cands: { nodeId: string; edgeId: string; fromNode: string; weight: number }[] = [];
    for (const id of nodeIds) {
      if (!inTree.has(id) && prev[id]) {
        cands.push({
          nodeId: id,
          edgeId: prev[id].edgeId,
          fromNode: prev[id].fromNode,
          weight: dist[id] ?? Infinity,
        });
      }
    }
    return cands.sort((a, b) => a.weight - b.weight);
  };

  while (inTree.size < nodeIds.length) {
    const candidates = getCandidates();
    if (candidates.length === 0) break;

    const best = candidates[0];
    const { nodeId: next, edgeId, fromNode, weight } = best;

    setNonTreeEdgesRejected();
    for (const c of candidates) {
      edgeStates[c.edgeId] = "current";
    }
    pushStep(
      `Consider edges from tree to non-tree. Minimum: ${fromNode}-${next} (weight ${weight}).`,
      { auxiliary: { currentVertex: fromNode } }
    );

    setNonTreeEdgesRejected();
    edgeStates[edgeId] = "inTree";
    nodeStates[next] = "inTree";
    inTree.add(next);
    pushStep(
      `Add edge ${fromNode}-${next} (weight ${weight}) and node ${next} to MST. Total edges: ${inTree.size - 1}.`,
      { auxiliary: { currentVertex: next } }
    );

    for (const { nodeId, edgeId: eid, weight: w } of adj[next] ?? []) {
      if (!inTree.has(nodeId) && w < (dist[nodeId] ?? Infinity)) {
        dist[nodeId] = w;
        prev[nodeId] = { edgeId: eid, fromNode: next };
        pq.addOrUpdate(w, nodeId);
      }
    }
  }

  setNonTreeEdgesRejected();
  const mstEdges = graph.edges.filter((e) => edgeStates[e.id] === "inTree");
  const totalWeight = mstEdges.reduce((s, e) => s + (e.weight ?? 1), 0);
  pushStep(
    `Prim complete. MST has ${mstEdges.length} edges, total weight ${totalWeight}.`,
    { auxiliary: {} }
  );

  return steps;
}

registerAlgorithm({
  id: "prim",
  name: "Prim",
  description:
    "Prim: builds minimum spanning tree (MST) by growing from a start node. " +
    "At each step, adds the minimum-weight edge connecting the tree to a new vertex. Time O(V²) or O(E log V) with heap, space O(V).",
  category: "mst",
  supportsWeighted: true,
  supportsDirected: false,
  supportsUndirected: true,
  requiresEndNode: false,
  requiresStartNode: true,
  requiresNonNegativeWeights: true,
  run: primRun,
});

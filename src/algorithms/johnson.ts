import type { Graph, AlgorithmStep, NodeVisualState, EdgeVisualState } from "@/types/graph";
import {
  buildAdjList,
  buildAllEdges,
  createStepRecorder,
  reconstructPath,
  createPriorityQueue,
  applyPathToStates,
  type AdjEdgeWeighted,
  type AllEdge,
} from "./utils";
import { registerAlgorithm } from "./registry";

const Q_ID = "johnson-q";

function johnsonRun(graph: Graph, startNode: string, endNode?: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const pushStep = createStepRecorder({ graph, nodeStates, edgeStates, steps });

  const nodeIds = graph.nodes.map((n) => n.id);
  const n = nodeIds.length;
  const weightFn = graph.weighted ? (w: number) => w : () => 1;

  if (n === 0) {
    pushStep("Graph is empty.");
    return steps;
  }
  if (!nodeIds.includes(startNode)) {
    pushStep(`Start node ${startNode} not found in graph.`);
    return steps;
  }

  pushStep("1. Bellman-Ford from virtual vertex q (q connected with zero-weight edges to all). Computing h(v).");

  const allEdges = buildAllEdges(graph);
  const bfEdges: AllEdge[] = [
    ...nodeIds.map((id) => ({ source: Q_ID, target: id, edgeId: `j-q-${id}`, weight: 0 })),
    ...allEdges,
  ];

  const h: Record<string, number> = {};
  for (const id of nodeIds) h[id] = Infinity;
  h[Q_ID] = 0;

  for (let iter = 0; iter < n - 1; iter++) {
    let updated = false;
    const bfDist: Record<string, number> = {};
    for (const id of nodeIds) bfDist[id] = h[id] ?? Infinity;

    pushStep(`Bellman-Ford: iteration ${iter + 1}/${n - 1}.`, { distances: bfDist });

    for (const { source, target, edgeId, weight } of bfEdges) {
      const srcH = h[source] ?? Infinity;
      if (srcH === Infinity) continue;

      const newH = srcH + weight;
      if (newH < (h[target] ?? Infinity)) {
        h[target] = newH;
        updated = true;
        if (source !== Q_ID) edgeStates[edgeId] = "current";
        nodeStates[target] = "inQueue";
        const bfDistRelax: Record<string, number> = {};
        for (const id of nodeIds) bfDistRelax[id] = h[id] ?? Infinity;
        pushStep(`Relax ${source} -> ${target} (weight ${weight}). h(${target})=${newH}`, {
          distances: bfDistRelax,
        });
        if (source !== Q_ID) edgeStates[edgeId] = "traversed";
        nodeStates[target] = "visited";
      }
    }

    if (!updated) {
      const earlyDist: Record<string, number> = {};
      for (const id of nodeIds) earlyDist[id] = h[id] ?? Infinity;
      pushStep(`Iteration ${iter + 1}: no updates. Early termination.`, { distances: earlyDist });
      break;
    }
  }

  for (const { source, target, weight } of bfEdges) {
    const srcH = h[source] ?? Infinity;
    if (srcH === Infinity) continue;
    if (srcH + weight < (h[target] ?? Infinity)) {
      pushStep("Negative cycle detected! Algorithm aborted.");
      return steps;
    }
  }

  const hDist: Record<string, number> = {};
  for (const id of nodeIds) hDist[id] = h[id] ?? Infinity;
  pushStep("2. Bellman-Ford complete. h(v) computed.", { distances: hDist });

  pushStep("3. Reweighting: w'(u,v) = w(u,v) + h(u) - h(v). Applying formula to each edge.", {
    distances: hDist,
  });

  const edgeWeightOverrides: Record<string, number> = {};
  for (let i = 0; i < graph.edges.length; i++) {
    const e = graph.edges[i];
    const w = weightFn(e.weight ?? 1);
    const hu = h[e.source] ?? 0;
    const hv = h[e.target] ?? 0;
    const wPrime = Math.round((w + hu - hv) * 100) / 100;
    edgeWeightOverrides[e.id] = wPrime;

    edgeStates[e.id] = "current";
    nodeStates[e.source] = "visited";
    nodeStates[e.target] = "visited";

    pushStep(
      `Edge ${e.source}->${e.target}: w' = w + h(${e.source}) - h(${e.target}) = ${w} + ${hu} - ${hv} = ${wPrime}.`,
      {
        edgeWeightOverrides: { ...edgeWeightOverrides },
        distances: hDist,
      }
    );

    edgeStates[e.id] = "traversed";
  }

  for (const id of nodeIds) nodeStates[id] = "default";
  for (const e of graph.edges) edgeStates[e.id] = "default";

  pushStep(`4. Reweighting complete. Running Dijkstra from ${startNode}.`, {
    edgeWeightOverrides,
  });

  const adj = buildAdjList(graph, true) as Record<string, AdjEdgeWeighted[]>;
  const adjReweighted: Record<string, AdjEdgeWeighted[]> = {};
  for (const node of graph.nodes) {
    const id = node.id;
    adjReweighted[id] = (adj[id] ?? []).map(({ nodeId, edgeId, weight }) => ({
      nodeId,
      edgeId,
      weight: weightFn(weight) + (h[id] ?? 0) - (h[nodeId] ?? 0),
    }));
  }

  const distPrime: Record<string, number> = {};
  const prev: Record<string, { nodeId: string; edgeId: string } | null> = {};
  for (const id of nodeIds) {
    distPrime[id] = Infinity;
    prev[id] = null;
  }
  distPrime[startNode] = 0;
  prev[startNode] = null;

  const pq = createPriorityQueue();
  const visited = new Set<string>();
  pq.addOrUpdate(0, startNode);

  nodeStates[startNode] = "inQueue";
  const initDistPrime: Record<string, number> = {};
  for (const id of nodeIds) initDistPrime[id] = distPrime[id] ?? Infinity;
  pushStep(`Dijkstra: initialize from ${startNode}.`, {
    edgeWeightOverrides,
    auxiliary: {
      queues: [{ items: [startNode], type: "priority", label: "Queue d'", itemsWithDist: [{ dist: 0, nodeId: startNode }] }],
      lastAddedToQueue: startNode,
      lastAddedToQueueIndex: 0,
    },
    distances: initDistPrime,
  });

  for (let i = 0; i < n; i++) {
    const item = pq.extractMin();
    if (!item) break;

    const { dist: minDistPrime, nodeId: current } = item;
    if (visited.has(current)) continue;

    visited.add(current);
    nodeStates[current] = "current";
    const distPrimeDisplay: Record<string, number> = {};
    for (const id of nodeIds) distPrimeDisplay[id] = distPrime[id] ?? Infinity;
    pushStep(`Extract ${current}. d'=${minDistPrime.toFixed(1)}, d=${(minDistPrime + (h[current] ?? 0) - (h[startNode] ?? 0)).toFixed(1)}.`, {
      edgeWeightOverrides,
      auxiliary: {
        queues: [{ items: pq.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Queue d'", itemsWithDist: pq.toSortedArray() }],
        currentVertex: current,
        extractedInThisStep: true,
        currentVertexQueueIndex: 0,
      },
      distances: distPrimeDisplay,
    });

    if (current === endNode) {
      const path = reconstructPath(prev, startNode, endNode);
      if (path) {
        const totalDist = minDistPrime + (h[endNode] ?? 0) - (h[startNode] ?? 0);
        const distRecord: Record<string, number> = {};
        for (const id of nodeIds) {
          const d = distPrime[id];
          distRecord[id] = d === Infinity ? Infinity : d + (h[id] ?? 0) - (h[startNode] ?? 0);
        }
        const hStart = h[startNode] ?? 0;

        for (const id of nodeIds) nodeStates[id] = "default";
        const pathConverted = new Set<string>([startNode]);
        pushStep("5. Converting d' to d: d(v) = d'(v) - h(s) + h(v). Restoring original distances and edge weights.", {
          distances: distPrime,
        });

        for (const v of path.nodes) {
          if (v === startNode) continue;
          const dp = distPrime[v] ?? Infinity;
          const hv = h[v] ?? 0;
          const d = distRecord[v] ?? Infinity;
          nodeStates[v] = "current";
          const stepDist: Record<string, number> = {};
          for (const id of nodeIds) stepDist[id] = pathConverted.has(id) ? (distRecord[id] ?? Infinity) : (distPrime[id] ?? Infinity);
          stepDist[v] = d;
          pushStep(
            `Vertex ${v}: d(${v}) = d'(${v}) + h(${v}) - h(${startNode}) = ${dp.toFixed(1)} + ${hv} - ${hStart} = ${d.toFixed(1)}.`,
            { distances: stepDist }
          );
          pathConverted.add(v);
          nodeStates[v] = "visited";
        }

        applyPathToStates(path, nodeStates, edgeStates);
        pushStep(`Shortest path to ${endNode}: distance ${totalDist.toFixed(1)}.`, {
          data: { pathNodeIds: path.nodes },
          distances: distRecord,
        });
      }
      return steps;
    }

    const neighbors = adjReweighted[current] ?? [];
    for (const { nodeId, edgeId, weight: wPrime } of neighbors) {
      if (visited.has(nodeId)) continue;
      const newDistPrime = minDistPrime + wPrime;
      if (newDistPrime < (distPrime[nodeId] ?? Infinity)) {
        distPrime[nodeId] = newDistPrime;
        prev[nodeId] = { nodeId: current, edgeId };
        pq.addOrUpdate(newDistPrime, nodeId);
        edgeStates[edgeId] = "current";
        nodeStates[nodeId] = "inQueue";
        const distPrimeDisplay: Record<string, number> = {};
        for (const id of nodeIds) distPrimeDisplay[id] = (id === nodeId ? newDistPrime : distPrime[id]) ?? Infinity;
        pushStep(`Relax ${current} -> ${nodeId}. d'=${newDistPrime.toFixed(1)}.`, {
          edgeWeightOverrides,
          auxiliary: {
            queues: [{ items: pq.toSortedArray().map((x) => x.nodeId), type: "priority", label: "Queue d'", itemsWithDist: pq.toSortedArray() }],
            currentVertex: current,
            lastAddedToQueue: nodeId,
            lastAddedToQueueIndex: 0,
          },
          distances: distPrimeDisplay,
        });
        edgeStates[edgeId] = "traversed";
      }
    }

    nodeStates[current] = "visited";
  }

  const distRecord: Record<string, number> = {};
  for (const id of nodeIds) {
    const d = distPrime[id];
    distRecord[id] = d === Infinity ? Infinity : d + (h[id] ?? 0) - (h[startNode] ?? 0);
  }
  const hStart = h[startNode] ?? 0;

  for (const id of nodeIds) nodeStates[id] = "default";
  const converted = new Set<string>([startNode]);
  pushStep("5. Converting d' to d: d(v) = d'(v) - h(s) + h(v). Restoring original distances and edge weights.", {
    distances: distPrime,
  });

  const reachedNodes = nodeIds.filter((id) => distPrime[id] !== Infinity && id !== startNode);
  for (const v of reachedNodes) {
    const dp = distPrime[v] ?? Infinity;
    const hv = h[v] ?? 0;
    const d = distRecord[v] ?? Infinity;
    nodeStates[v] = "current";
    const stepDist: Record<string, number> = {};
    for (const id of nodeIds) stepDist[id] = converted.has(id) ? (distRecord[id] ?? Infinity) : (distPrime[id] ?? Infinity);
    stepDist[v] = d;
    pushStep(
      `Vertex ${v}: d(${v}) = d'(${v}) + h(${v}) - h(${startNode}) = ${dp.toFixed(1)} + ${hv} - ${hStart} = ${d.toFixed(1)}.`,
      { distances: stepDist }
    );
    converted.add(v);
    nodeStates[v] = "visited";
  }

  for (const id of nodeIds) nodeStates[id] = "default";
  pushStep(
    endNode
      ? `Johnson complete. ${endNode} unreachable from ${startNode}.`
      : `Johnson complete. Shortest paths from ${startNode} computed.`,
    { distances: distRecord }
  );
  return steps;
}

registerAlgorithm({
  id: "johnson",
  name: "Johnson",
  description:
    "Johnson: all-pairs shortest paths with negative weights. Bellman-Ford reweighting + Dijkstra. " +
    "Detects negative cycles. O(V² log V + VE).",
  category: "shortest-path",
  supportsWeighted: true,
  supportsDirected: true,
  supportsUndirected: true,
  requiresEndNode: false,
  run: johnsonRun,
});

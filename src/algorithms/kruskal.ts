import type {
  Graph,
  AlgorithmStep,
  NodeVisualState,
  EdgeVisualState,
  PriorityQueueItem,
} from "@/types/graph";
import { createStepRecorder } from "./utils";
import { registerAlgorithm } from "./registry";

class UnionFind {
  private parent: Record<string, string> = {};
  private rank: Record<string, number> = {};

  makeSet(x: string) {
    if (!(x in this.parent)) {
      this.parent[x] = x;
      this.rank[x] = 0;
    }
  }

  find(x: string): string {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: string, y: string): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;
    if ((this.rank[rx] ?? 0) < (this.rank[ry] ?? 0)) {
      this.parent[rx] = ry;
    } else {
      this.parent[ry] = rx;
      if ((this.rank[rx] ?? 0) === (this.rank[ry] ?? 0)) {
        this.rank[rx] = (this.rank[rx] ?? 0) + 1;
      }
    }
    return true;
  }
}

function kruskalRun(graph: Graph, startNode: string, _endNode?: string): AlgorithmStep[] {
  const nodeIds = graph.nodes.map((n) => n.id);
  const steps: AlgorithmStep[] = [];
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};

  for (const id of nodeIds) nodeStates[id] = "default";
  for (const e of graph.edges) edgeStates[e.id] = "default";

  const weight = (e: { weight?: number }) => (graph.weighted ? (e.weight ?? 1) : 1);

  const pushStep = createStepRecorder({
    graph,
    nodeStates,
    edgeStates,
    steps,
  });

  const sortedEdges = [...graph.edges].sort((a, b) => weight(a) - weight(b));
  const toQueueItem = (e: { source: string; target: string; weight?: number }): PriorityQueueItem => ({
    dist: weight(e),
    nodeId: `${e.source}-${e.target}`,
  });

  pushStep("Initial state. Graph is gray. Kruskal uses a priority queue of edges (min by weight).");

  const pqItems: PriorityQueueItem[] = sortedEdges.map(toQueueItem);
  pushStep("Add all edges to priority queue (sorted by weight).", {
    auxiliary: {
      queues: [{
        label: "Priority queue (edges)",
        type: "priority",
        items: pqItems.map((x) => x.nodeId),
        itemsWithDist: pqItems,
      }],
    },
  });

  const uf = new UnionFind();
  for (const n of graph.nodes) uf.makeSet(n.id);

  let mstEdgeCount = 0;
  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    const remaining = pqItems.slice(i);

    edgeStates[edge.id] = "current";
    pushStep(
      `Extract min: ${edge.source}-${edge.target} (weight ${weight(edge)}).`,
      {
        auxiliary: {
          queues: [{
            label: "Priority queue (edges)",
            type: "priority",
            items: remaining.map((x) => x.nodeId),
            itemsWithDist: remaining,
          }],
          extractedInThisStep: true,
          currentVertexQueueIndex: 0,
          currentVertex: edge.source,
        },
      }
    );

    const wouldConnect = uf.union(edge.source, edge.target);
    if (wouldConnect) {
      edgeStates[edge.id] = "inTree";
      nodeStates[edge.source] = "inTree";
      nodeStates[edge.target] = "inTree";
      mstEdgeCount++;
      pushStep(
        `Add edge ${edge.source}-${edge.target} (weight ${weight(edge)}) to MST. No cycle. MST edges: ${mstEdgeCount}.`,
        {
          auxiliary: {
            queues: [{
              label: "Priority queue (edges)",
              type: "priority",
              items: pqItems.slice(i + 1).map((x) => x.nodeId),
              itemsWithDist: pqItems.slice(i + 1),
            }],
            currentVertex: edge.target,
          },
        }
      );
    } else {
      edgeStates[edge.id] = "rejected";
      pushStep(
        `Reject edge ${edge.source}-${edge.target}: would create cycle. Skip.`,
        {
          auxiliary: {
            queues: [{
              label: "Priority queue (edges)",
              type: "priority",
              items: pqItems.slice(i + 1).map((x) => x.nodeId),
              itemsWithDist: pqItems.slice(i + 1),
            }],
          },
        }
      );
    }
  }

  const mstEdges = graph.edges.filter((e) => edgeStates[e.id] === "inTree");
  const totalWeight = mstEdges.reduce((s, e) => s + weight(e), 0);
  pushStep(
    `Kruskal complete. MST has ${mstEdges.length} edges, total weight ${totalWeight}.`,
    { auxiliary: { queues: [] } }
  );

  return steps;
}

registerAlgorithm({
  id: "kruskal",
  name: "Kruskal",
  description:
    "Kruskal: builds minimum spanning tree (MST) by sorting edges by weight and adding them in order " +
    "if they don't create a cycle (Union-Find). Time O(E log E), space O(V).",
  category: "mst",
  supportsWeighted: true,
  supportsDirected: false,
  supportsUndirected: true,
  requiresEndNode: false,
  requiresStartNode: false,
  requiresNonNegativeWeights: true,
  run: kruskalRun,
});

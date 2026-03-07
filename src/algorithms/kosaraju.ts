import type {
  Graph,
  AlgorithmStep,
  NodeVisualState,
  EdgeVisualState,
  KosarajuExitIndicesData,
} from "@/types/graph";
import { buildAdjList, buildReverseAdjList } from "./utils";
import { registerAlgorithm } from "./registry";

function kosarajuRun(graph: Graph, startNode: string, _endNode?: string): AlgorithmStep[] {
  const adj = buildAdjList(graph);
  const revAdj = buildReverseAdjList(graph);
  const nodeIds = graph.nodes.map((n) => n.id);
  const steps: AlgorithmStep[] = [];
  const nodeStates: Record<string, NodeVisualState> = {};
  const edgeStates: Record<string, EdgeVisualState> = {};
  const exitIndices: Record<string, number> = {};
  let nextExitIndex = 0;
  const visited1 = new Set<string>();
  const orderByExit: string[] = [];

  const pushKosarajuStep = (
    description: string,
    extra: Partial<AlgorithmStep> & {
      data?: { kosarajuExitIndices?: KosarajuExitIndicesData; sccColors?: Record<string, number>; showReversedEdges?: boolean };
    }
  ) => {
    const phase = extra.data?.kosarajuExitIndices?.phase ?? "dfs1";
    const exitData: KosarajuExitIndicesData = {
      nodeIds,
      exitIndices: { ...exitIndices },
      currentVertex: extra.auxiliary?.currentVertex,
      currentIndex: extra.data?.kosarajuExitIndices?.currentIndex,
      phase,
    };
    const step: AlgorithmStep = {
      nodeStates: { ...nodeStates },
      edgeStates: { ...edgeStates },
      description,
      distances: Object.fromEntries(
        nodeIds.map((id) => [id, exitIndices[id] ?? Infinity])
      ),
      auxiliary: extra.auxiliary,
      data: {
        ...extra.data,
        kosarajuExitIndices: exitData,
        sccColors: extra.data?.sccColors,
        showReversedEdges: extra.data?.showReversedEdges,
      },
    };
    steps.push(step);
  };

  pushKosarajuStep(
    "Phase 1: DFS on original graph. Assign exit indices (post-order) to each vertex.",
    { data: { kosarajuExitIndices: { nodeIds, exitIndices: {}, phase: "dfs1" } } }
  );

  function dfs1(u: string) {
    visited1.add(u);
    nodeStates[u] = "current";
    pushKosarajuStep(`DFS from ${u}. Visit and recurse.`, {
      auxiliary: { currentVertex: u },
      data: { kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs1", currentVertex: u, currentIndex: nextExitIndex } },
    });

    for (const { nodeId: v, edgeId } of adj[u] ?? []) {
      if (!visited1.has(v)) {
        edgeStates[edgeId] = "current";
        pushKosarajuStep(`Explore edge ${u} - > ${v}.`, {
          auxiliary: { currentVertex: u },
          data: { kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs1", currentVertex: u, currentIndex: nextExitIndex } },
        });
        dfs1(v);
        edgeStates[edgeId] = "traversed";
      }
    }

    exitIndices[u] = nextExitIndex++;
    orderByExit.push(u);
    nodeStates[u] = "visited";
    const assignedIndex = exitIndices[u];
    pushKosarajuStep(`Exit ${u}. Assign exit index ${assignedIndex}.`, {
      auxiliary: { currentVertex: u },
      data: { kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs1", currentVertex: u, currentIndex: assignedIndex } },
    });
  }

  for (const n of graph.nodes) {
    if (!visited1.has(n.id)) {
      dfs1(n.id);
    }
  }

  pushKosarajuStep(
    `Phase 1 complete. Exit indices assigned. Order by decreasing exit index: [${[...orderByExit].reverse().join(", ")}].`,
    { data: { kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs1" } } }
  );

  for (const id of nodeIds) {
    nodeStates[id] = "default";
  }
  for (const e of graph.edges) {
    edgeStates[e.id] = "default";
  }

  const visited2 = new Set<string>();
  const sccId = new Map<string, number>();
  let sccCount = 0;
  const sccVertices: string[][] = [];

  pushKosarajuStep(
    "Phase 2: Reverse all edges. DFS on reversed graph in order of decreasing exit index.",
    { data: { kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs2" } } }
  );

  pushKosarajuStep(
    "Graph inverted. All edges now point in reverse direction.",
    { data: { kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs2" }, showReversedEdges: true } }
  );

  function dfs2(u: string, compId: number) {
    visited2.add(u);
    sccId.set(u, compId);
    sccVertices[compId] = sccVertices[compId] ?? [];
    sccVertices[compId].push(u);

    const sccColors: Record<string, number> = {};
    for (const [vid, cid] of sccId) sccColors[vid] = cid;

    nodeStates[u] = "current";
    pushKosarajuStep(`DFS on reversed graph: visit ${u} (index ${exitIndices[u]}). Add to SCC #${compId + 1}.`, {
      auxiliary: { currentVertex: u },
      data: {
        kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs2", currentVertex: u, currentIndex: exitIndices[u] },
        sccColors,
        showReversedEdges: true,
      },
    });

    for (const { nodeId: v, edgeId } of revAdj[u] ?? []) {
      if (!visited2.has(v)) {
        edgeStates[edgeId] = "current";
        pushKosarajuStep(`Reversed edge: ${v} - > ${u}. Explore to ${v}.`, {
          auxiliary: { currentVertex: u },
          data: {
            kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs2", currentVertex: u, currentIndex: exitIndices[u] },
            sccColors,
            showReversedEdges: true,
          },
        });
        dfs2(v, compId);
        edgeStates[edgeId] = "traversed";
      }
    }

    nodeStates[u] = "visited";
    pushKosarajuStep(`Finish ${u}. SCC #${compId + 1} = [${sccVertices[compId].join(", ")}].`, {
      auxiliary: { currentVertex: u },
      data: {
        kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs2", currentVertex: u, currentIndex: exitIndices[u] },
        sccColors,
        showReversedEdges: true,
      },
    });
  }

  for (let i = orderByExit.length - 1; i >= 0; i--) {
    const u = orderByExit[i];
    if (!visited2.has(u)) {
      dfs2(u, sccCount);
      sccCount++;
    }
  }

  const sccColors: Record<string, number> = {};
  for (const [vid, cid] of sccId) sccColors[vid] = cid;

  pushKosarajuStep(
    `Kosaraju complete. Found ${sccCount} strongly connected component(s).`,
    {
      data: {
        kosarajuExitIndices: { nodeIds, exitIndices: { ...exitIndices }, phase: "dfs2" },
        sccColors,
        showReversedEdges: true,
      },
    }
  );

  return steps;
}

registerAlgorithm({
  id: "kosaraju",
  name: "Kosaraju",
  description:
    "Kosaraju: finds strongly connected components (SCCs) in a directed graph. " +
    "Phase 1: DFS assigns exit indices. Phase 2: DFS on reversed graph. Time O(V + E), space O(V).",
  category: "scc",
  supportsWeighted: false,
  supportsDirected: true,
  supportsUndirected: false,
  requiresEndNode: false,
  requiresStartNode: false,
  usesExitIndices: true,
  run: kosarajuRun,
});

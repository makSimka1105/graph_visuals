import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GraphNode, GraphEdge, HeuristicType } from "@/types/graph";

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  acyclic: boolean;
  showDistances: boolean;
  startNodeId: string | null;
  endNodeId: string | null;
  heuristicType: HeuristicType;
  version: number;
  sourcePresetId: string | null;
  isModified: boolean;
}

const initialState: GraphState = {
  nodes: [],
  edges: [],
  directed: false,
  weighted: false,
  acyclic: false,
  showDistances: false,
  startNodeId: null,
  endNodeId: null,
  heuristicType: "euclidean",
  version: 0,
  sourcePresetId: null,
  isModified: false,
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {
    setGraph(state, action: PayloadAction<{ nodes: GraphNode[]; edges: GraphEdge[]; sourcePresetId?: string | null }>) {
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
      state.startNodeId = null;
      state.endNodeId = null;
      state.version += 1;
      state.sourcePresetId = action.payload.sourcePresetId ?? null;
      state.isModified = false;
    },
    setDirected(state, action: PayloadAction<boolean>) {
      state.directed = action.payload;
    },
    setWeighted(state, action: PayloadAction<boolean>) {
      state.weighted = action.payload;
    },
    setAcyclic(state, action: PayloadAction<boolean>) {
      state.acyclic = action.payload;
    },
    setShowDistances(state, action: PayloadAction<boolean>) {
      state.showDistances = action.payload;
    },
    setStartNode(state, action: PayloadAction<string | null>) {
      state.startNodeId = action.payload;
    },
    setEndNode(state, action: PayloadAction<string | null>) {
      state.endNodeId = action.payload;
    },
    setHeuristicType(state, action: PayloadAction<HeuristicType>) {
      state.heuristicType = action.payload;
    },
    addNode(state, action: PayloadAction<GraphNode>) {
      state.nodes.push(action.payload);
      state.isModified = true;
    },
    removeNode(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.nodes = state.nodes.filter((n) => n.id !== id);
      state.edges = state.edges.filter((e) => e.source !== id && e.target !== id);
      if (state.startNodeId === id) state.startNodeId = null;
      if (state.endNodeId === id) state.endNodeId = null;
      state.isModified = true;
    },
    addEdge(state, action: PayloadAction<GraphEdge>) {
      state.edges.push(action.payload);
      state.isModified = true;
    },
    removeEdge(state, action: PayloadAction<string>) {
      state.edges = state.edges.filter((e) => e.id !== action.payload);
      state.isModified = true;
    },
    updateEdgeWeight(state, action: PayloadAction<{ id: string; weight: number }>) {
      const edge = state.edges.find((e) => e.id === action.payload.id);
      if (edge) edge.weight = action.payload.weight;
      state.isModified = true;
    },
    updateNodePositions(state, action: PayloadAction<{ id: string; x: number; y: number }[]>) {
      for (const pos of action.payload) {
        const node = state.nodes.find((n) => n.id === pos.id);
        if (node) {
        node.x = pos.x;
        node.y = pos.y;
        }
      }
      state.isModified = true;
    },
    recalculateWeightsByGeometry(state) {
      const posMap = new Map<string, { x: number; y: number }>();
      for (const n of state.nodes) {
        posMap.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      }
      const SCALE = 0.01;
      for (const e of state.edges) {
        const a = posMap.get(e.source) ?? { x: 0, y: 0 };
        const b = posMap.get(e.target) ?? { x: 0, y: 0 };
        const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2) * SCALE;
        e.weight = Math.max(1, Math.round(dist * 10));
      }
      state.weighted = true;
      state.isModified = true;
      state.version += 1;
    },
  },
});

export const {
  setGraph,
  setDirected,
  setWeighted,
  setAcyclic,
  setShowDistances,
  setStartNode,
  setEndNode,
  setHeuristicType,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  updateEdgeWeight,
  updateNodePositions,
  recalculateWeightsByGeometry,
} = graphSlice.actions;

export default graphSlice.reducer;

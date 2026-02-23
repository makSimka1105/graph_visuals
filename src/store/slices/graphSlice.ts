import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GraphNode, GraphEdge } from "@/types/graph";

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  acyclic: boolean;
  showDistances: boolean;
  startNodeId: string | null;
  endNodeId: string | null;
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
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  updateEdgeWeight,
  updateNodePositions,
} = graphSlice.actions;

export default graphSlice.reducer;

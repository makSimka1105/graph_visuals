import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { GraphNode, GraphEdge, AlgorithmStep, HeuristicType } from "@/types/graph";

interface ComparisonGraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNodeId: string | null;
  endNodeId: string | null;
  version: number;
  sourcePresetId: string | null;
  isModified: boolean;
  heuristicType: HeuristicType;
}

type PlaybackState = "idle" | "playing" | "paused" | "finished";

const emptyGraphState: ComparisonGraphState = {
  nodes: [],
  edges: [],
  startNodeId: null,
  endNodeId: null,
  version: 0,
  sourcePresetId: null,
  isModified: false,
  heuristicType: "euclidean",
};

interface ComparisonState {
  graphA: ComparisonGraphState;
  graphB: ComparisonGraphState;
  algA: string | null;
  algB: string | null;
  stepsA: AlgorithmStep[];
  stepsB: AlgorithmStep[];
  currentStepIndex: number;
  playbackState: PlaybackState;
  speed: number;
  directed: boolean;
  weighted: boolean;
  acyclic: boolean;
  showDistances: boolean;
  metrics: Array<{
    algorithmId: string;
    algorithmName: string;
    executionTimeMs: number;
    stepsCount: number;
    pathLength: number | null;
    visitedNodes: number;
  }>;
}

const initialState: ComparisonState = {
  graphA: { ...emptyGraphState },
  graphB: { ...emptyGraphState },
  algA: null,
  algB: null,
  stepsA: [],
  stepsB: [],
  currentStepIndex: -1,
  playbackState: "idle",
  speed: 500,
  directed: false,
  weighted: false,
  acyclic: false,
  showDistances: false,
  metrics: [],
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    setGraphA(state, action: PayloadAction<{ nodes: GraphNode[]; edges: GraphEdge[]; sourcePresetId?: string | null }>) {
      state.graphA.nodes = action.payload.nodes;
      state.graphA.edges = action.payload.edges;
      state.graphA.startNodeId = null;
      state.graphA.endNodeId = null;
      state.graphA.version += 1;
      state.graphA.sourcePresetId = action.payload.sourcePresetId ?? null;
      state.graphA.isModified = false;
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
    },
    setGraphB(state, action: PayloadAction<{ nodes: GraphNode[]; edges: GraphEdge[]; sourcePresetId?: string | null }>) {
      state.graphB.nodes = action.payload.nodes;
      state.graphB.edges = action.payload.edges;
      state.graphB.startNodeId = null;
      state.graphB.endNodeId = null;
      state.graphB.version += 1;
      state.graphB.sourcePresetId = action.payload.sourcePresetId ?? null;
      state.graphB.isModified = false;
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
    },
    setStartNodeA(state, action: PayloadAction<string | null>) {
      state.graphA.startNodeId = action.payload;
    },
    setEndNodeA(state, action: PayloadAction<string | null>) {
      state.graphA.endNodeId = action.payload;
    },
    setStartNodeB(state, action: PayloadAction<string | null>) {
      state.graphB.startNodeId = action.payload;
    },
    setEndNodeB(state, action: PayloadAction<string | null>) {
      state.graphB.endNodeId = action.payload;
    },
    addNodeA(state, action: PayloadAction<GraphNode>) {
      state.graphA.nodes.push(action.payload);
      state.graphA.isModified = true;
    },
    removeNodeA(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.graphA.nodes = state.graphA.nodes.filter((n) => n.id !== id);
      state.graphA.edges = state.graphA.edges.filter((e) => e.source !== id && e.target !== id);
      if (state.graphA.startNodeId === id) state.graphA.startNodeId = null;
      if (state.graphA.endNodeId === id) state.graphA.endNodeId = null;
      state.graphA.isModified = true;
    },
    addEdgeA(state, action: PayloadAction<GraphEdge>) {
      state.graphA.edges.push(action.payload);
      state.graphA.isModified = true;
    },
    removeEdgeA(state, action: PayloadAction<string>) {
      state.graphA.edges = state.graphA.edges.filter((e) => e.id !== action.payload);
      state.graphA.isModified = true;
    },
    updateEdgeWeightA(state, action: PayloadAction<{ id: string; weight: number }>) {
      const edge = state.graphA.edges.find((e) => e.id === action.payload.id);
      if (edge) edge.weight = action.payload.weight;
      state.graphA.isModified = true;
    },
    updateNodePositionsA(state, action: PayloadAction<{ id: string; x: number; y: number }[]>) {
      for (const pos of action.payload) {
        const node = state.graphA.nodes.find((n) => n.id === pos.id);
        if (node) {
          node.x = pos.x;
          node.y = pos.y;
        }
      }
      state.graphA.isModified = true;
    },
    addNodeB(state, action: PayloadAction<GraphNode>) {
      state.graphB.nodes.push(action.payload);
      state.graphB.isModified = true;
    },
    removeNodeB(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.graphB.nodes = state.graphB.nodes.filter((n) => n.id !== id);
      state.graphB.edges = state.graphB.edges.filter((e) => e.source !== id && e.target !== id);
      if (state.graphB.startNodeId === id) state.graphB.startNodeId = null;
      if (state.graphB.endNodeId === id) state.graphB.endNodeId = null;
      state.graphB.isModified = true;
    },
    addEdgeB(state, action: PayloadAction<GraphEdge>) {
      state.graphB.edges.push(action.payload);
      state.graphB.isModified = true;
    },
    removeEdgeB(state, action: PayloadAction<string>) {
      state.graphB.edges = state.graphB.edges.filter((e) => e.id !== action.payload);
      state.graphB.isModified = true;
    },
    updateEdgeWeightB(state, action: PayloadAction<{ id: string; weight: number }>) {
      const edge = state.graphB.edges.find((e) => e.id === action.payload.id);
      if (edge) edge.weight = action.payload.weight;
      state.graphB.isModified = true;
    },
    updateNodePositionsB(state, action: PayloadAction<{ id: string; x: number; y: number }[]>) {
      for (const pos of action.payload) {
        const node = state.graphB.nodes.find((n) => n.id === pos.id);
        if (node) {
          node.x = pos.x;
          node.y = pos.y;
        }
      }
      state.graphB.isModified = true;
    },
    setAlgA(state, action: PayloadAction<string | null>) {
      state.algA = action.payload;
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
    },
    setAlgB(state, action: PayloadAction<string | null>) {
      state.algB = action.payload;
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
    },
    comparisonSetDirected(state, action: PayloadAction<boolean>) {
      state.directed = action.payload;
    },
    comparisonSetWeighted(state, action: PayloadAction<boolean>) {
      state.weighted = action.payload;
    },
    comparisonSetAcyclic(state, action: PayloadAction<boolean>) {
      state.acyclic = action.payload;
    },
    comparisonSetShowDistances(state, action: PayloadAction<boolean>) {
      state.showDistances = action.payload;
    },
    comparisonSetHeuristicTypeA(state, action: PayloadAction<HeuristicType>) {
      state.graphA.heuristicType = action.payload;
    },
    comparisonSetHeuristicTypeB(state, action: PayloadAction<HeuristicType>) {
      state.graphB.heuristicType = action.payload;
    },
    comparisonRecalculateWeightsA(state) {
      const posMap = new Map<string, { x: number; y: number }>();
      for (const n of state.graphA.nodes) {
        posMap.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      }
      const SCALE = 0.01;
      for (const e of state.graphA.edges) {
        const a = posMap.get(e.source) ?? { x: 0, y: 0 };
        const b = posMap.get(e.target) ?? { x: 0, y: 0 };
        const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2) * SCALE;
        e.weight = Math.max(1, Math.round(dist * 10));
      }
      state.weighted = true;
      state.graphA.isModified = true;
      state.graphA.version += 1;
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
    },
    comparisonRecalculateWeightsB(state) {
      const posMap = new Map<string, { x: number; y: number }>();
      for (const n of state.graphB.nodes) {
        posMap.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      }
      const SCALE = 0.01;
      for (const e of state.graphB.edges) {
        const a = posMap.get(e.source) ?? { x: 0, y: 0 };
        const b = posMap.get(e.target) ?? { x: 0, y: 0 };
        const dist = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2) * SCALE;
        e.weight = Math.max(1, Math.round(dist * 10));
      }
      state.weighted = true;
      state.graphB.isModified = true;
      state.graphB.version += 1;
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
    },
    setStepsA(state, action: PayloadAction<AlgorithmStep[]>) {
      state.stepsA = action.payload;
      state.currentStepIndex = -1;
      state.playbackState = "paused";
    },
    setStepsB(state, action: PayloadAction<AlgorithmStep[]>) {
      state.stepsB = action.payload;
    },
    setMetrics(state, action: PayloadAction<ComparisonState["metrics"]>) {
      state.metrics = action.payload;
    },
    comparisonStepForward(state) {
      const maxSteps = Math.max(state.stepsA.length, state.stepsB.length);
      if (state.currentStepIndex < maxSteps - 1) {
        state.currentStepIndex += 1;
      }
      if (state.currentStepIndex >= maxSteps - 1) {
        state.playbackState = "finished";
      }
    },
    comparisonStepBackward(state) {
      if (state.currentStepIndex > -1) {
        state.currentStepIndex -= 1;
      }
      if (state.playbackState === "finished") {
        state.playbackState = "paused";
      }
    },
    comparisonGoToStep(state, action: PayloadAction<number>) {
      const idx = action.payload;
      const maxSteps = Math.max(state.stepsA.length, state.stepsB.length);
      if (idx >= -1 && idx < maxSteps) {
        state.currentStepIndex = idx;
        state.playbackState = idx >= maxSteps - 1 ? "finished" : "paused";
      }
    },
    comparisonPlay(state) {
      const maxSteps = Math.max(state.stepsA.length, state.stepsB.length);
      if (maxSteps > 0 && state.currentStepIndex < maxSteps - 1) {
        state.playbackState = "playing";
      }
    },
    comparisonPause(state) {
      if (state.playbackState === "playing") {
        state.playbackState = "paused";
      }
    },
    comparisonSetSpeed(state, action: PayloadAction<number>) {
      state.speed = action.payload;
    },
    comparisonResetPlayback(state) {
      state.currentStepIndex = -1;
      state.playbackState = "idle";
    },
    comparisonClearResults(state) {
      state.stepsA = [];
      state.stepsB = [];
      state.metrics = [];
      state.currentStepIndex = -1;
      state.playbackState = "idle";
    },
  },
});

export const {
  setGraphA,
  setGraphB,
  setStartNodeA,
  setEndNodeA,
  setStartNodeB,
  setEndNodeB,
  addNodeA,
  removeNodeA,
  addEdgeA,
  removeEdgeA,
  updateEdgeWeightA,
  updateNodePositionsA,
  addNodeB,
  removeNodeB,
  addEdgeB,
  removeEdgeB,
  updateEdgeWeightB,
  updateNodePositionsB,
  setAlgA,
  setAlgB,
  comparisonSetDirected,
  comparisonSetWeighted,
  comparisonSetAcyclic,
  comparisonSetShowDistances,
  comparisonSetHeuristicTypeA,
  comparisonSetHeuristicTypeB,
  comparisonRecalculateWeightsA,
  comparisonRecalculateWeightsB,
  setStepsA,
  setStepsB,
  setMetrics,
  comparisonStepForward,
  comparisonStepBackward,
  comparisonGoToStep,
  comparisonPlay,
  comparisonPause,
  comparisonSetSpeed,
  comparisonResetPlayback,
  comparisonClearResults,
} = comparisonSlice.actions;

export default comparisonSlice.reducer;
export type { ComparisonGraphState, ComparisonState };

export interface GraphNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: number;
}

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
}

export type NodeVisualState =
  | "default"
  | "visited"
  | "current"
  | "inQueue"
  | "path"
  | "start"
  | "end"
  | "visitedBackward"
  | "currentBackward"
  | "inQueueBackward";

export type EdgeVisualState =
  | "default"
  | "traversed"
  | "current"
  | "path"
  | "traversedBackward"
  | "currentBackward";

export interface PriorityQueueItem {
  dist: number;
  nodeId: string;
}

export interface DequeItemWithSource {
  nodeId: string;
  fromFront: boolean;
}

export interface AuxiliaryQueue {
  label?: string;
  items: string[];
  type: "queue" | "stack" | "deque" | "priority";
  itemsWithDist?: PriorityQueueItem[];
  itemsWithSource?: DequeItemWithSource[];
}

export interface AuxiliaryData {
  queues?: AuxiliaryQueue[];
  currentVertex?: string;
  lastAddedToQueue?: string;
  extractedInThisStep?: boolean;
  currentVertexQueueIndex?: number;
  lastAddedToQueueIndex?: number;
  lastAddedToQueueSide?: "left" | "right";
}

export interface FloydMatrixData {
  matrix: number[][];
  nodeIds: string[];
  phaseIndex: number;
  updatedInPhase: string[];
}

export interface AlgorithmStep {
  nodeStates: Record<string, NodeVisualState>;
  edgeStates: Record<string, EdgeVisualState>;
  description: string;
  data?: Record<string, unknown>;
  distances?: Record<string, number>;
  auxiliary?: AuxiliaryData;
  edgeWeightOverrides?: Record<string, number>;
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  description: string;
  category: "shortest-path";
  supportsWeighted: boolean;
  supportsDirected: boolean;
  supportsUndirected: boolean;
  requiresEndNode: boolean;
  requiresNonNegativeWeights?: boolean;
  run: (graph: Graph, startNode: string, endNode?: string) => AlgorithmStep[];
}

export interface AlgorithmMetrics {
  algorithmId: string;
  algorithmName: string;
  executionTimeMs: number;
  stepsCount: number;
  pathLength: number | null;
  visitedNodes: number;
}

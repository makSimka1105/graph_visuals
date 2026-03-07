import type { AppDispatch } from "@/store/store";
import type { GraphNode, GraphEdge } from "@/types/graph";
import {
  updateNodePositions,
  addNode as addNodeAction,
  removeNode as removeNodeAction,
  addEdge as addEdgeAction,
  removeEdge as removeEdgeAction,
  updateEdgeWeight,
  setStartNode,
  setEndNode,
} from "@/store/slices/graphSlice";
import { resetPlayback } from "@/store/slices/algorithmSlice";
import {
  updateNodePositionsA,
  updateNodePositionsB,
  addNodeA,
  addNodeB,
  removeNodeA,
  removeNodeB,
  addEdgeA,
  addEdgeB,
  removeEdgeA,
  removeEdgeB,
  updateEdgeWeightA,
  updateEdgeWeightB,
  setStartNodeA,
  setEndNodeA,
  setStartNodeB,
  setEndNodeB,
  comparisonResetPlayback,
} from "@/store/slices/comparisonSlice";

export type GraphCanvasSource = "main" | "A" | "B";

export interface GraphCanvasActions {
  addNode: (node: GraphNode) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: GraphEdge) => void;
  removeEdge: (edgeId: string) => void;
  updateEdgeWeight: (payload: { id: string; weight: number }) => void;
  setStartNode: (nodeId: string | null) => void;
  setEndNode: (nodeId: string | null) => void;
  updateNodePositions: (changes: { id: string; x: number; y: number }[]) => void;
  resetPlayback: () => void;
}

export function createGraphCanvasActions(
  dispatch: AppDispatch,
  source: GraphCanvasSource
): GraphCanvasActions {
  return {
    addNode(node) {
      if (source === "main") {
        dispatch(addNodeAction(node));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(addNodeA(node));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(addNodeB(node));
        dispatch(comparisonResetPlayback());
      }
    },

    removeNode(nodeId) {
      if (source === "main") {
        dispatch(removeNodeAction(nodeId));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(removeNodeA(nodeId));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(removeNodeB(nodeId));
        dispatch(comparisonResetPlayback());
      }
    },

    addEdge(edge) {
      if (source === "main") {
        dispatch(addEdgeAction(edge));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(addEdgeA(edge));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(addEdgeB(edge));
        dispatch(comparisonResetPlayback());
      }
    },

    removeEdge(edgeId) {
      if (source === "main") {
        dispatch(removeEdgeAction(edgeId));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(removeEdgeA(edgeId));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(removeEdgeB(edgeId));
        dispatch(comparisonResetPlayback());
      }
    },

    updateEdgeWeight(payload) {
      if (source === "main") {
        dispatch(updateEdgeWeight(payload));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(updateEdgeWeightA(payload));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(updateEdgeWeightB(payload));
        dispatch(comparisonResetPlayback());
      }
    },

    setStartNode(nodeId) {
      if (source === "main") {
        dispatch(setStartNode(nodeId));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(setStartNodeA(nodeId));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(setStartNodeB(nodeId));
        dispatch(comparisonResetPlayback());
      }
    },

    setEndNode(nodeId) {
      if (source === "main") {
        dispatch(setEndNode(nodeId));
        dispatch(resetPlayback());
      } else if (source === "A") {
        dispatch(setEndNodeA(nodeId));
        dispatch(comparisonResetPlayback());
      } else {
        dispatch(setEndNodeB(nodeId));
        dispatch(comparisonResetPlayback());
      }
    },

    updateNodePositions(changes) {
      if (source === "main") {
        dispatch(updateNodePositions(changes));
      } else if (source === "A") {
        dispatch(updateNodePositionsA(changes));
      } else {
        dispatch(updateNodePositionsB(changes));
      }
    },

    resetPlayback() {
      if (source === "main") {
        dispatch(resetPlayback());
      } else {
        dispatch(comparisonResetPlayback());
      }
    },
  };
}

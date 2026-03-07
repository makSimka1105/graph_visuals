import { useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import { getAlgorithm } from "@/algorithms/registry";
import type { GraphCanvasStoreData } from "./useGraphCanvasData";

export interface UseGraphFlowElementsParams {
  storeData: GraphCanvasStoreData;
  selectedNodeId: string | null;
  edgeSourceId: string | null;
  isTouchDevice: boolean;
  onEdgeClick: (ev: React.MouseEvent, edge: Edge) => void;
}

export function useGraphFlowElements({
  storeData,
  selectedNodeId,
  edgeSourceId,
  isTouchDevice,
  onEdgeClick,
}: UseGraphFlowElementsParams): { flowNodes: Node[]; flowEdges: Edge[] } {
  const {
    graphNodes,
    graphEdges,
    graphVersion,
    currentStep,
    startNodeId,
    endNodeId,
    showDistances,
    directed,
    weighted,
    selectedAlgorithmId,
  } = storeData;
  const stepForDistances = currentStep ?? (storeData.steps.length > 0 ? storeData.steps[0] : null);
  const pathNodeIds = currentStep?.data?.pathNodeIds as string[] | undefined;
  const sccColors = currentStep?.data?.sccColors as Record<string, number> | undefined;
  const showReversedEdges = currentStep?.data?.showReversedEdges === true;
  const alg = selectedAlgorithmId ? getAlgorithm(selectedAlgorithmId) : null;
  const usesExitIndices = alg?.usesExitIndices ?? false;

  const flowNodes: Node[] = useMemo(() => {
    return graphNodes.map((n) => {
      let visualState = currentStep?.nodeStates[n.id] ?? "default";
      if (pathNodeIds?.includes(n.id)) visualState = "path";
      else if (visualState === "default" && alg?.category !== "mst" && n.id === startNodeId) visualState = "start";
      else if (visualState === "default" && alg?.category !== "mst" && n.id === endNodeId) visualState = "end";
      const distance = showDistances ? stepForDistances?.distances?.[n.id] : undefined;
      const sccColorIndex = sccColors?.[n.id];
      return {
        id: n.id,
        type: "custom",
        position: { x: n.x ?? 0, y: n.y ?? 0 },
        data: {
          label: n.label,
          visualState,
          isEdgeSource: n.id === edgeSourceId,
          distance,
          distanceLabel: usesExitIndices ? ("exitIndex" as const) : ("distance" as const),
          sccColorIndex,
        },
      };
    });
  }, [
    graphNodes,
    currentStep,
    stepForDistances,
    startNodeId,
    endNodeId,
    edgeSourceId,
    pathNodeIds,
    showDistances,
    sccColors,
    usesExitIndices,
  ]);

  const flowEdges: Edge[] = useMemo(() => {
    const overrides = currentStep?.edgeWeightOverrides;
    return graphEdges.map((e) => {
      const w = overrides?.[e.id] ?? e.weight ?? 1;
      const src = showReversedEdges ? e.target : e.source;
      const tgt = showReversedEdges ? e.source : e.target;
      const edge = { id: e.id, source: src, target: tgt } as Edge;
      return {
        id: e.id,
        source: src,
        target: tgt,
        type: "custom",
        markerEnd: undefined,
        data: {
          weight: (weighted || overrides) ? w : undefined,
          visualState: currentStep?.edgeStates[e.id] ?? "default",
          directed,
          selectedNodeId,
          onEdgeClick: isTouchDevice ? undefined : (ev: React.MouseEvent) => onEdgeClick(ev, edge),
        },
      };
    });
  }, [graphEdges, directed, weighted, currentStep, selectedNodeId, onEdgeClick, isTouchDevice, showReversedEdges, graphVersion]);

  return { flowNodes, flowEdges };
}

import { useAppSelector, useCurrentStep } from "@/store/hooks";
import type { GraphCanvasSource } from "@/lib/graphCanvasActions";
import type { GraphNode, GraphEdge, AlgorithmStep } from "@/types/graph";

export interface GraphCanvasStoreData {
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  startNodeId: string | null;
  endNodeId: string | null;
  showDistances: boolean;
  acyclic: boolean;
  graphVersion: number;
  steps: AlgorithmStep[];
  currentStep: AlgorithmStep | null;
  isPlayback: boolean;
  selectedAlgorithmId: string | null;
}

export function useGraphCanvasStoreData(source: GraphCanvasSource): GraphCanvasStoreData {
  const mainGraph = useAppSelector((state) => state.graph);
  const compState = useAppSelector((state) => state.comparison);
  const { steps: mainSteps, currentStep: mainCurrentStep } = useCurrentStep();

  const isComparison = source !== "main";

  const graphNodes = isComparison
    ? source === "A"
      ? compState.graphA.nodes
      : compState.graphB.nodes
    : mainGraph.nodes;
  const graphEdges = isComparison
    ? source === "A"
      ? compState.graphA.edges
      : compState.graphB.edges
    : mainGraph.edges;
  const directed = isComparison ? compState.directed : mainGraph.directed;
  const weighted = isComparison ? compState.weighted : mainGraph.weighted;
  const startNodeId = isComparison
    ? source === "A"
      ? compState.graphA.startNodeId
      : compState.graphB.startNodeId
    : mainGraph.startNodeId;
  const endNodeId = isComparison
    ? source === "A"
      ? compState.graphA.endNodeId
      : compState.graphB.endNodeId
    : mainGraph.endNodeId;
  const showDistances = isComparison ? compState.showDistances : mainGraph.showDistances;
  const acyclic = isComparison ? compState.acyclic : mainGraph.acyclic;
  const graphVersion = isComparison
    ? source === "A"
      ? compState.graphA.version
      : compState.graphB.version
    : mainGraph.version;

  const steps = isComparison
    ? source === "A"
      ? compState.stepsA
      : compState.stepsB
    : mainSteps;
  const mainAlgId = useAppSelector((s) => s.algorithm.selectedAlgorithmId);
  const selectedAlgorithmId = isComparison
    ? source === "A"
      ? compState.algA
      : compState.algB
    : mainAlgId;
  const compStepIndex = compState.currentStepIndex;
  const currentStep = isComparison
    ? steps.length > 0 && compStepIndex >= 0
      ? steps[Math.min(compStepIndex, steps.length - 1)] ?? null
      : null
    : mainCurrentStep;

  const isPlayback = steps.length > 0;

  return {
    graphNodes,
    graphEdges,
    directed,
    weighted,
    startNodeId,
    endNodeId,
    showDistances,
    acyclic,
    graphVersion,
    steps,
    currentStep,
    isPlayback,
    selectedAlgorithmId,
  };
}

import type {
  Graph,
  AlgorithmStep,
  NodeVisualState,
  EdgeVisualState,
} from "@/types/graph";

export interface StepBuilderContext {
  graph: Graph;
  nodeStates: Record<string, NodeVisualState>;
  edgeStates: Record<string, EdgeVisualState>;
  steps: AlgorithmStep[];
  dist?: Record<string, number>;
}

export function distancesForStep(
  dist: Record<string, number>,
  graph: Graph
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const node of graph.nodes) {
    const d = dist[node.id];
    result[node.id] = d !== undefined ? d : Infinity;
  }
  return result;
}

export function createStepRecorder(
  ctx: StepBuilderContext
): (description: string, extra?: Partial<AlgorithmStep>) => void {
  return (description: string, extra?: Partial<AlgorithmStep>) => {
    const step: AlgorithmStep = {
      nodeStates: { ...ctx.nodeStates },
      edgeStates: { ...ctx.edgeStates },
      description,
      ...(ctx.dist !== undefined
        ? { distances: distancesForStep(ctx.dist, ctx.graph) }
        : {}),
      ...extra,
    };
    ctx.steps.push(step);
  };
}

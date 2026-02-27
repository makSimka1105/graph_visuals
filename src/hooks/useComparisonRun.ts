import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setStepsA,
  setStepsB,
  setMetrics,
} from "@/store/slices/comparisonSlice";
import { getAlgorithm } from "@/algorithms/registry";
import { checkCompatibility } from "@/lib/graphValidator";

function countPathNodes(step: { nodeStates: Record<string, string> } | null): number {
  return step ? Object.values(step.nodeStates).filter((s) => s === "path").length : 0;
}

function countVisitedNodes(step: { nodeStates: Record<string, string> } | null): number {
  return step ? Object.values(step.nodeStates).filter((s) => s !== "default").length : 0;
}

export function useComparisonRun() {
  const dispatch = useAppDispatch();
  const comp = useAppSelector((s) => s.comparison);

  const algA = comp.algA ? getAlgorithm(comp.algA) : null;
  const algB = comp.algB ? getAlgorithm(comp.algB) : null;

  const compatA = useMemo(
    () =>
      algA
        ? checkCompatibility(algA, {
            directed: comp.directed,
            weighted: comp.weighted,
            acyclic: comp.acyclic,
            nodes: comp.graphA.nodes,
            edges: comp.graphA.edges,
          })
        : null,
    [algA, comp.directed, comp.weighted, comp.acyclic, comp.graphA.nodes, comp.graphA.edges]
  );
  const compatB = useMemo(
    () =>
      algB
        ? checkCompatibility(algB, {
            directed: comp.directed,
            weighted: comp.weighted,
            acyclic: comp.acyclic,
            nodes: comp.graphB.nodes,
            edges: comp.graphB.edges,
          })
        : null,
    [algB, comp.directed, comp.weighted, comp.acyclic, comp.graphB.nodes, comp.graphB.edges]
  );

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (comp.graphA.nodes.length === 0) errors.push("Load graph A");
    if (comp.graphB.nodes.length === 0) errors.push("Load graph B");
    if (!comp.graphA.startNodeId && comp.graphA.nodes.length > 0) errors.push("Select start node in graph A");
    if (!comp.graphB.startNodeId && comp.graphB.nodes.length > 0) errors.push("Select start node in graph B");
    if (!comp.algA) errors.push("Select algorithm A");
    if (!comp.algB) errors.push("Select algorithm B");
    if (algA?.requiresEndNode && !comp.graphA.endNodeId) errors.push("Algorithm A requires end node");
    if (algB?.requiresEndNode && !comp.graphB.endNodeId) errors.push("Algorithm B requires end node");
    if (comp.graphA.startNodeId === comp.graphA.endNodeId && comp.graphA.startNodeId != null)
      errors.push("Graph A: start and end must differ");
    if (comp.graphB.startNodeId === comp.graphB.endNodeId && comp.graphB.startNodeId != null)
      errors.push("Graph B: start and end must differ");
    if (compatA?.ok === false)
      errors.push(`A: ${compatA.warnings.find((w) => w.severity === "error")?.message ?? "incompatible"}`);
    if (compatB?.ok === false)
      errors.push(`B: ${compatB.warnings.find((w) => w.severity === "error")?.message ?? "incompatible"}`);
    return errors;
  }, [comp, algA, algB, compatA, compatB]);

  const canRun = validation.length === 0;

  const handleRun = () => {
    if (!canRun || !comp.algA || !comp.algB || !algA || !algB) return;
    if (!comp.graphA.startNodeId || !comp.graphB.startNodeId) return;

    const graphA = {
      nodes: comp.graphA.nodes,
      edges: comp.graphA.edges,
      directed: comp.directed,
      weighted: comp.weighted,
    };
    const graphB = {
      nodes: comp.graphB.nodes,
      edges: comp.graphB.edges,
      directed: comp.directed,
      weighted: comp.weighted,
    };

    const startA = performance.now();
    const resA = algA.run(
      graphA as Parameters<typeof algA.run>[0],
      comp.graphA.startNodeId,
      comp.graphA.endNodeId ?? undefined
    );
    const timeA = performance.now() - startA;

    const startB = performance.now();
    const resB = algB.run(
      graphB as Parameters<typeof algB.run>[0],
      comp.graphB.startNodeId,
      comp.graphB.endNodeId ?? undefined
    );
    const timeB = performance.now() - startB;

    dispatch(setStepsA(resA));
    dispatch(setStepsB(resB));

    const lastA = resA[resA.length - 1] ?? null;
    const lastB = resB[resB.length - 1] ?? null;

    dispatch(
      setMetrics([
        {
          algorithmId: comp.algA,
          algorithmName: algA.name,
          executionTimeMs: timeA,
          stepsCount: resA.length,
          pathLength: countPathNodes(lastA) > 0 ? countPathNodes(lastA) - 1 : null,
          visitedNodes: countVisitedNodes(lastA),
        },
        {
          algorithmId: comp.algB,
          algorithmName: algB.name,
          executionTimeMs: timeB,
          stepsCount: resB.length,
          pathLength: countPathNodes(lastB) > 0 ? countPathNodes(lastB) - 1 : null,
          visitedNodes: countVisitedNodes(lastB),
        },
      ])
    );
  };

  return { canRun, handleRun, validation };
}

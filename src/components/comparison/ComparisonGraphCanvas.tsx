"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useAppSelector } from "@/store/hooks";
import { CustomNode } from "@/components/graph/CustomNode";
import { CustomEdge } from "@/components/graph/CustomEdge";
import type { AlgorithmStep } from "@/types/graph";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

interface Props {
  step: AlgorithmStep | null;
}

export function ComparisonGraphCanvas({ step }: Props) {
  const graphNodes = useAppSelector((s) => s.graph.nodes);
  const graphEdges = useAppSelector((s) => s.graph.edges);
  const directed = useAppSelector((s) => s.graph.directed);
  const weighted = useAppSelector((s) => s.graph.weighted);
  const showDistances = useAppSelector((s) => s.graph.showDistances);
  const startNodeId = useAppSelector((s) => s.graph.startNodeId);
  const endNodeId = useAppSelector((s) => s.graph.endNodeId);

  const pathNodeIds = step?.data?.pathNodeIds as string[] | undefined;
  const overrides = step?.edgeWeightOverrides;

  const flowNodes: Node[] = useMemo(() => {
    return graphNodes.map((n) => {
      let visualState = step?.nodeStates[n.id] ?? "default";
      if (pathNodeIds?.includes(n.id)) visualState = "path";
      else if (visualState === "default" && n.id === startNodeId) visualState = "start";
      else if (visualState === "default" && n.id === endNodeId) visualState = "end";
      const distance = showDistances ? step?.distances?.[n.id] : undefined;
      return {
        id: n.id,
        type: "custom",
        position: { x: n.x ?? 0, y: n.y ?? 0 },
        data: { label: n.label, visualState, distance },
        draggable: false,
      };
    });
  }, [graphNodes, step, startNodeId, endNodeId, pathNodeIds, showDistances]);

  const flowEdges: Edge[] = useMemo(() => {
    return graphEdges.map((e) => {
      const w = overrides?.[e.id] ?? e.weight ?? 1;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: "custom",
        markerEnd: undefined,
        data: {
          weight: (weighted || overrides) ? w : undefined,
          visualState: step?.edgeStates[e.id] ?? "default",
          directed,
        },
      };
    });
  }, [graphEdges, directed, weighted, step, overrides]);

  return (
    <div className="w-full h-full touch-none">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
      </ReactFlow>
    </div>
  );
}

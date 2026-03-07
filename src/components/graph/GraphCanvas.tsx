"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type ReactFlowInstance,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useAppDispatch } from "@/store/hooks";
import { CustomNode } from "./CustomNode";
import { CustomEdge } from "./CustomEdge";
import { EmptyState } from "./EmptyState";
import {
  ContextMenuOverlay,
  EdgeWeightEditorOverlay,
  CanvasHintsOverlay,
  EdgeCreationBanner,
  CycleWarningBanner,
} from "./overlays";
import { createGraphCanvasActions } from "@/lib/graphCanvasActions";
import { useGraphCanvasStoreData } from "@/hooks/useGraphCanvasData";
import { useGraphFlowElements } from "@/hooks/useGraphFlowElements";
import { useGraphGestures, type ContextMenu } from "@/hooks/useGraphGestures";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

export type GraphCanvasSource = "main" | "A" | "B";

interface GraphCanvasProps {
  source?: GraphCanvasSource;
}

export function GraphCanvas({ source = "main" }: GraphCanvasProps) {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  const [cycleWarning, setCycleWarning] = useState(false);
  const [editingEdge, setEditingEdge] = useState<{
    edgeId: string;
    weight: number;
    weightInput: string;
    x: number;
    y: number;
  } | null>(null);
  const [ctxMenu, setCtxMenu] = useState<ContextMenu>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const actions = useMemo(() => createGraphCanvasActions(dispatch, source), [dispatch, source]);
  const storeData = useGraphCanvasStoreData(source);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const closeMenu = useCallback(() => setCtxMenu(null), []);

  const gestureHandlers = useGraphGestures({
    rfInstance,
    actions,
    storeData,
    source,
    selectedNodeId,
    setSelectedNodeId,
    edgeSourceId,
    setEdgeSourceId,
    ctxMenu,
    setCtxMenu,
    setEditingEdge,
    setCycleWarning,
    containerRef,
    closeMenu,
    onNodesChange,
  });

  const { flowNodes, flowEdges } = useGraphFlowElements({
    storeData,
    selectedNodeId,
    edgeSourceId,
    isTouchDevice,
    onEdgeClick: gestureHandlers.handleEdgeClick,
  });

  useEffect(() => setNodes(flowNodes), [flowNodes, setNodes]);
  useEffect(() => setEdges(flowEdges), [flowEdges, setEdges]);

  useEffect(() => {
    const check = () => setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    check();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!ctxMenu) return;
    const handler = () => closeMenu();
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [ctxMenu, closeMenu]);

  useEffect(() => {
    if (!editingEdge) return;
    const handler = () => setEditingEdge(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [editingEdge]);

  useEffect(() => {
    if (!rfInstance || storeData.graphNodes.length === 0) return;
    const timer = setTimeout(() => {
      rfInstance.fitView({ padding: 0.12, duration: 300 });
    }, 80);
    return () => clearTimeout(timer);
  }, [storeData.graphVersion, rfInstance]);

  const isComparison = source !== "main";

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <EmptyState nodesOverride={isComparison ? storeData.graphNodes : undefined} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={!storeData.isPlayback}
        onNodesChange={gestureHandlers.handleNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setRfInstance}
        onNodeClick={gestureHandlers.handleNodeClick}
        onPaneClick={gestureHandlers.handlePaneClick}
        onEdgeClick={gestureHandlers.handleEdgeClick}
        onConnect={gestureHandlers.handleConnect}
        onNodeDoubleClick={gestureHandlers.handleNodeDoubleClick}
        onEdgeDoubleClick={gestureHandlers.handleEdgeDoubleClick}
        onNodeContextMenu={gestureHandlers.handleNodeContextMenu}
        onPaneContextMenu={gestureHandlers.handlePaneContextMenu}
        onEdgeContextMenu={gestureHandlers.handleEdgeContextMenu}
        onNodesDelete={gestureHandlers.handleNodesDelete}
        zoomOnDoubleClick={false}
        autoPanOnNodeFocus={false}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode="Delete"
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
        <Controls
          position="top-right"
          className="!bg-zinc-800 !border-zinc-700 !rounded-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700"
        />
      </ReactFlow>

      {edgeSourceId && (
        <EdgeCreationBanner
          edgeSourceId={edgeSourceId}
          isTouchDevice={isTouchDevice}
          onCancel={() => setEdgeSourceId(null)}
        />
      )}

      <CycleWarningBanner show={cycleWarning} />

      <ContextMenuOverlay
        ctxMenu={ctxMenu}
        onAddNode={gestureHandlers.doAddNode}
        onDeleteNode={gestureHandlers.doDeleteNode}
        onSetStart={gestureHandlers.doSetStart}
        onSetEnd={gestureHandlers.doSetEnd}
        onStartEdgeCreation={gestureHandlers.doStartEdgeCreation}
        onOpenWeightEditor={gestureHandlers.doOpenWeightEditor}
        onDeleteEdge={gestureHandlers.doDeleteEdge}
        onResetPlayback={() => {
          actions.resetPlayback();
          closeMenu();
        }}
      />

      {editingEdge && (
        <EdgeWeightEditorOverlay
          editingEdge={editingEdge}
          onWeightInputChange={(value) =>
            setEditingEdge((prev) => prev && { ...prev, weightInput: value })
          }
          onApply={() => gestureHandlers.handleApplyEdgeWeight(editingEdge)}
          onKeyDown={(e) => gestureHandlers.handleEditingEdgeKeyDown(e, editingEdge)}
        />
      )}

      <CanvasHintsOverlay
        isTouchDevice={isTouchDevice}
        isPlayback={storeData.isPlayback}
        edgeSourceId={edgeSourceId}
      />
    </div>
  );
}

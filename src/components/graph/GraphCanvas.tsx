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
  type NodeChange,
  type ReactFlowInstance,
  type Connection,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Plus,
  Trash2,
  Play as PlayIcon,
  Flag,
  Link,
  Hash,
} from "lucide-react";

import { useAppSelector, useAppDispatch, useCurrentStep } from "@/store/hooks";
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
import { wouldCreateCycle } from "@/lib/graphValidator";
import { CustomNode } from "./CustomNode";
import { CustomEdge } from "./CustomEdge";
import { EmptyState } from "./EmptyState";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

type CtxMenu =
  | { type: "pane"; screenX: number; screenY: number; flowX: number; flowY: number }
  | { type: "node"; screenX: number; screenY: number; nodeId: string }
  | { type: "edge"; screenX: number; screenY: number; edgeId: string }
  | null;

export function GraphCanvas() {
  const dispatch = useAppDispatch();
  const graphNodes = useAppSelector((state) => state.graph.nodes);
  const graphEdges = useAppSelector((state) => state.graph.edges);
  const directed = useAppSelector((state) => state.graph.directed);
  const weighted = useAppSelector((state) => state.graph.weighted);
  const startNodeId = useAppSelector((state) => state.graph.startNodeId);
  const endNodeId = useAppSelector((state) => state.graph.endNodeId);
  const showDistances = useAppSelector((state) => state.graph.showDistances);
  const { steps, currentStep } = useCurrentStep();

  const acyclic = useAppSelector((state) => state.graph.acyclic);
  const graphVersion = useAppSelector((state) => state.graph.version);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu>(null);
  const [edgeSourceId, setEdgeSourceId] = useState<string | null>(null);
  const [cycleWarning, setCycleWarning] = useState(false);
  const [editingEdge, setEditingEdge] = useState<{ edgeId: string; weight: number; weightInput: string; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPaneClickRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const DBL_CLICK_MS = 400;
  const DBL_CLICK_DIST = 10;
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    const check = () => setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    check();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  const isPlayback = steps.length > 0;
  const stepForDistances = currentStep ?? (steps.length > 0 ? steps[0] : null);

  const closeMenu = useCallback(() => setCtxMenu(null), []);

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

  const pathNodeIds = currentStep?.data?.pathNodeIds as string[] | undefined;

  const openEdgeMenu = useCallback(
    (event: React.MouseEvent, edgeId: string) => {
      if (isPlayback || edgeSourceId) return;
      event.stopPropagation();
      setEditingEdge(null);
      setCtxMenu({ type: "edge", screenX: event.clientX, screenY: event.clientY, edgeId });
    },
    [isPlayback, edgeSourceId]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      openEdgeMenu(event, edge.id);
    },
    [openEdgeMenu]
  );

  const handleEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      openEdgeMenu(event, edge.id);
    },
    [openEdgeMenu]
  );

  const flowNodes: Node[] = useMemo(() => {
    return graphNodes.map((n) => {
      let visualState = currentStep?.nodeStates[n.id] ?? "default";
      if (pathNodeIds?.includes(n.id)) visualState = "path";
      else if (visualState === "default" && n.id === startNodeId) visualState = "start";
      else if (visualState === "default" && n.id === endNodeId) visualState = "end";
      const distance = showDistances ? stepForDistances?.distances?.[n.id] : undefined;
      return {
        id: n.id,
        type: "custom",
        position: { x: n.x ?? 0, y: n.y ?? 0 },
        data: { label: n.label, visualState, isEdgeSource: n.id === edgeSourceId, distance },
      };
    });
  }, [graphNodes, currentStep, stepForDistances, startNodeId, endNodeId, edgeSourceId, pathNodeIds, showDistances]);

  const flowEdges: Edge[] = useMemo(() => {
    const overrides = currentStep?.edgeWeightOverrides;
    return graphEdges.map((e) => {
      const w = overrides?.[e.id] ?? e.weight ?? 1;
      const edge = { id: e.id, source: e.source, target: e.target } as Edge;
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: "custom",
        markerEnd: undefined,
        data: {
          weight: (weighted || overrides) ? w : undefined,
          visualState: currentStep?.edgeStates[e.id] ?? "default",
          directed,
          selectedNodeId,
          onEdgeClick: isTouchDevice ? undefined : (ev: React.MouseEvent) => handleEdgeClick(ev, edge),
        },
      };
    });
  }, [graphEdges, directed, weighted, currentStep, selectedNodeId, handleEdgeClick, isTouchDevice]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => { setNodes(flowNodes); }, [flowNodes, setNodes]);
  useEffect(() => { setEdges(flowEdges); }, [flowEdges, setEdges]);

  useEffect(() => {
    if (!rfInstance) return;
    if (graphNodes.length > 0) {
      const timer = setTimeout(() => {
        rfInstance.fitView({ padding: 0.12, duration: 300 });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [graphVersion, graphNodes.length, rfInstance]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      const positionChanges = changes
        .filter(
          (c): c is NodeChange & { type: "position"; position: { x: number; y: number }; dragging: boolean } =>
            c.type === "position" &&
            "dragging" in c &&
            !(c as { dragging?: boolean }).dragging &&
            "position" in c
        )
        .map((c) => ({ id: c.id, x: c.position.x, y: c.position.y }));
      if (positionChanges.length > 0) {
        dispatch(updateNodePositions(positionChanges));
      }
    },
    [onNodesChange, dispatch]
  );

  const nextNodeId = useCallback(() => {
    const maxId = graphNodes.reduce((m, nd) => Math.max(m, parseInt(nd.id) || 0), -1);
    return String(maxId + 1);
  }, [graphNodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (edgeSourceId) {
        if (edgeSourceId !== node.id) {
          const exists = graphEdges.some(
            (ed) => ed.source === edgeSourceId && ed.target === node.id
          );
          if (!exists) {
            dispatch(addEdgeAction({
              id: `e${edgeSourceId}-${node.id}`,
              source: edgeSourceId,
              target: node.id,
              weight: weighted ? Math.floor(Math.random() * 10) + 1 : 1,
            }));
            dispatch(resetPlayback());
            if (acyclic && wouldCreateCycle(graphNodes, graphEdges, directed, edgeSourceId, node.id)) {
              setCycleWarning(true);
              setTimeout(() => setCycleWarning(false), 4000);
            }
          }
        }
        setEdgeSourceId(null);
        return;
      }
      setSelectedNodeId(node.id);
    },
    [edgeSourceId, graphEdges, graphNodes, directed, acyclic, weighted, dispatch]
  );

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      const now = Date.now();
      const prev = lastPaneClickRef.current;
      const isDoubleClick =
        prev &&
        now - prev.time < DBL_CLICK_MS &&
        Math.abs(event.clientX - prev.x) < DBL_CLICK_DIST &&
        Math.abs(event.clientY - prev.y) < DBL_CLICK_DIST;

      if (isDoubleClick) {
        lastPaneClickRef.current = null;
        if (isPlayback || !rfInstance) return;
        const pos = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setCtxMenu({ type: "pane", screenX: event.clientX, screenY: event.clientY, flowX: pos.x, flowY: pos.y });
      } else {
        lastPaneClickRef.current = { time: now, x: event.clientX, y: event.clientY };
        setSelectedNodeId(null);
        if (edgeSourceId) setEdgeSourceId(null);
        setEditingEdge(null);
      }
    },
    [edgeSourceId, isPlayback, rfInstance]
  );

  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      if (isPlayback || !rfInstance) return;
      const pos = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCtxMenu({ type: "pane", screenX: event.clientX, screenY: event.clientY, flowX: pos.x, flowY: pos.y });
    },
    [isPlayback, rfInstance]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (isPlayback) return;
      setCtxMenu({ type: "node", screenX: event.clientX, screenY: event.clientY, nodeId: node.id });
    },
    [isPlayback]
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      if (isPlayback) return;
      setEditingEdge(null);
      setCtxMenu({ type: "edge", screenX: event.clientX, screenY: event.clientY, edgeId: edge.id });
    },
    [isPlayback]
  );

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (isPlayback) return;
      setCtxMenu({ type: "node", screenX: event.clientX, screenY: event.clientY, nodeId: node.id });
    },
    [isPlayback]
  );

  const handleApplyEdgeWeight = useCallback(() => {
    if (!editingEdge) return;
    const parsed = parseFloat(editingEdge.weightInput);
    const w = Number.isNaN(parsed) ? editingEdge.weight : parsed;
    dispatch(updateEdgeWeight({ id: editingEdge.edgeId, weight: w }));
    dispatch(resetPlayback());
    setEditingEdge(null);
  }, [editingEdge, dispatch]);

  const handleEditingEdgeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleApplyEdgeWeight();
      if (e.key === "Escape") setEditingEdge(null);
    },
    [handleApplyEdgeWeight]
  );

  const doAddNode = useCallback(() => {
    if (ctxMenu?.type !== "pane") return;
    const id = nextNodeId();
    dispatch(addNodeAction({ id, label: id, x: ctxMenu.flowX, y: ctxMenu.flowY }));
    dispatch(resetPlayback());
    closeMenu();
  }, [ctxMenu, nextNodeId, dispatch, closeMenu]);

  const doDeleteNode = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    dispatch(removeNodeAction(ctxMenu.nodeId));
    dispatch(resetPlayback());
    closeMenu();
  }, [ctxMenu, dispatch, closeMenu]);

  const doSetStart = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    dispatch(setStartNode(ctxMenu.nodeId));
    dispatch(resetPlayback());
    closeMenu();
  }, [ctxMenu, dispatch, closeMenu]);

  const doSetEnd = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    dispatch(setEndNode(ctxMenu.nodeId));
    dispatch(resetPlayback());
    closeMenu();
  }, [ctxMenu, dispatch, closeMenu]);

  const doStartEdgeCreation = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    setEdgeSourceId(ctxMenu.nodeId);
    closeMenu();
  }, [ctxMenu, closeMenu]);

  const doOpenWeightEditor = useCallback(() => {
    if (ctxMenu?.type !== "edge") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const edgeData = graphEdges.find((e) => e.id === ctxMenu.edgeId);
    const currentWeight = edgeData?.weight ?? 1;
    setEditingEdge({
      edgeId: ctxMenu.edgeId,
      weight: currentWeight,
      weightInput: String(currentWeight),
      x: ctxMenu.screenX - rect.left,
      y: ctxMenu.screenY - rect.top,
    });
    closeMenu();
  }, [ctxMenu, graphEdges, closeMenu]);

  const doDeleteEdge = useCallback(() => {
    if (ctxMenu?.type !== "edge") return;
    dispatch(removeEdgeAction(ctxMenu.edgeId));
    dispatch(resetPlayback());
    closeMenu();
  }, [ctxMenu, dispatch, closeMenu]);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (isPlayback) return;
      if (!connection.source || !connection.target || connection.source === connection.target) return;
      const exists = graphEdges.some(
        (ed) => ed.source === connection.source && ed.target === connection.target
      );
      if (exists) return;
      dispatch(addEdgeAction({
        id: `e${connection.source}-${connection.target}`,
        source: connection.source,
        target: connection.target,
        weight: weighted ? Math.floor(Math.random() * 10) + 1 : 1,
      }));
      dispatch(resetPlayback());
      if (acyclic && wouldCreateCycle(graphNodes, graphEdges, directed, connection.source, connection.target)) {
        setCycleWarning(true);
        setTimeout(() => setCycleWarning(false), 4000);
      }
    },
    [isPlayback, graphEdges, graphNodes, directed, acyclic, weighted, dispatch]
  );

  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (isPlayback) return;
      for (const nd of deleted) dispatch(removeNodeAction(nd.id));
      dispatch(resetPlayback());
    },
    [isPlayback, dispatch]
  );

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <EmptyState />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodesDraggable={!isPlayback}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={setRfInstance}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onEdgeClick={handleEdgeClick}
        onConnect={handleConnect}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeDoubleClick={handleEdgeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onNodesDelete={handleNodesDelete}
        zoomOnDoubleClick={false}
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
          position="top-left"
          className="!bg-zinc-800 !border-zinc-700 !rounded-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700"
        />
      </ReactFlow>

      {edgeSourceId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-sky-900/80 text-sky-200 text-xs px-4 py-2 rounded-lg border border-sky-700 flex items-center gap-2 z-50">
          <Link className="w-3.5 h-3.5" />
          {isTouchDevice ? "Tap" : "Click"} a target node to connect from <span className="font-bold">{edgeSourceId}</span>
          <button
            onClick={() => setEdgeSourceId(null)}
            className="ml-2 text-sky-400 hover:text-sky-200 underline"
          >
            Cancel
          </button>
        </div>
      )}

      {cycleWarning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-900/80 text-yellow-200 text-xs px-4 py-2 rounded-lg border border-yellow-700 z-50 animate-in fade-in duration-200">
          Edge added, but it created a cycle in an acyclic graph
        </div>
      )}

      {ctxMenu && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
          style={{ left: ctxMenu.screenX, top: ctxMenu.screenY }}
          onClick={(ev) => ev.stopPropagation()}
        >
          {ctxMenu.type === "pane" && (
            <MenuItem icon={<Plus className="w-3.5 h-3.5" />} label="Add Node" onClick={doAddNode} />
          )}
          {ctxMenu.type === "node" && (
            <>
              <MenuItem icon={<Link className="w-3.5 h-3.5" />} label="Add Edge from here..." onClick={doStartEdgeCreation} />
              <MenuItem icon={<PlayIcon className="w-3.5 h-3.5" />} label="Set as Start" onClick={doSetStart} />
              <MenuItem icon={<Flag className="w-3.5 h-3.5" />} label="Set as End" onClick={doSetEnd} />
              <div className="my-1 border-t border-zinc-800" />
              <MenuItem icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete Node" onClick={doDeleteNode} danger />
            </>
          )}
          {ctxMenu.type === "edge" && (
            <>
              <MenuItem icon={<Hash className="w-3.5 h-3.5" />} label="Change weight" onClick={doOpenWeightEditor} />
              <MenuItem icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete Edge" onClick={doDeleteEdge} danger />
            </>
          )}
        </div>
      )}

      {editingEdge && (
        <div
          className="absolute z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 p-3 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
          style={{ left: editingEdge.x, top: editingEdge.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-zinc-400">Edge weight</span>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={editingEdge.weightInput}
              onChange={(e) => setEditingEdge((prev) => prev && { ...prev, weightInput: e.target.value })}
              onKeyDown={handleEditingEdgeKeyDown}
              className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              autoFocus
            />
            <button
              onClick={handleApplyEdgeWeight}
              className="px-2 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {!isPlayback && !edgeSourceId && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] text-zinc-600 pointer-events-none select-none max-w-[95vw] px-2">
          {isTouchDevice ? (
            <>
              <span>Double-tap empty space to add node</span>
              <span>|</span>
              <span>Double-tap edge for menu</span>
              <span>|</span>
              <span>Tap node to select</span>
              <span>|</span>
              <span>Double-tap node for menu</span>
              <span>|</span>
              <span>Select + Delete to remove</span>
            </>
          ) : (
            <>
              <span>Right-click empty space to add node</span>
              <span>|</span>
              <span>Click edge for menu</span>
              <span>|</span>
              <span>Left click on node to select</span>
              <span>|</span>
              <span>Right-click node for menu</span>
              <span>|</span>
              <span>Select + Delete to remove</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-950/40"
          : "text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

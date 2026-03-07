import { useCallback, useRef } from "react";
import type { Node, Edge, NodeChange, Connection, ReactFlowInstance } from "@xyflow/react";
import type { GraphCanvasActions } from "@/lib/graphCanvasActions";
import type { GraphCanvasStoreData } from "./useGraphCanvasData";
import { wouldCreateCycle } from "@/lib/graphValidator";

const DBL_CLICK_MS = 400;
const DBL_CLICK_DIST = 10;
const NODE_SIZE = 40;
const NODE_OFFSET = NODE_SIZE / 2;

export type ContextMenu =
  | { type: "pane"; screenX: number; screenY: number; flowX: number; flowY: number }
  | { type: "node"; screenX: number; screenY: number; nodeId: string }
  | { type: "edge"; screenX: number; screenY: number; edgeId: string }
  | { type: "playback-locked"; screenX: number; screenY: number }
  | null;

export interface UseGraphGesturesParams {
  rfInstance: ReactFlowInstance | null;
  actions: GraphCanvasActions;
  storeData: GraphCanvasStoreData;
  source: "main" | "A" | "B";
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  edgeSourceId: string | null;
  setEdgeSourceId: (id: string | null) => void;
  ctxMenu: ContextMenu;
  setCtxMenu: (menu: ContextMenu) => void;
  setEditingEdge: (editing: { edgeId: string; weight: number; weightInput: string; x: number; y: number } | null) => void;
  setCycleWarning: (show: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  closeMenu: () => void;
  onNodesChange: (changes: NodeChange[]) => void;
}

export interface GraphGestureHandlers {
  handleNodeClick: (event: React.MouseEvent, node: Node) => void;
  handlePaneClick: (event: React.MouseEvent) => void;
  handlePaneContextMenu: (event: MouseEvent | React.MouseEvent) => void;
  handleNodeContextMenu: (event: React.MouseEvent, node: Node) => void;
  handleEdgeContextMenu: (event: React.MouseEvent, edge: Edge) => void;
  handleNodeDoubleClick: (event: React.MouseEvent, node: Node) => void;
  handleEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  handleEdgeDoubleClick: (event: React.MouseEvent, edge: Edge) => void;
  handleConnect: (connection: Connection) => void;
  handleNodesChange: (changes: NodeChange[]) => void;
  handleNodesDelete: (deleted: Node[]) => void;
  handleApplyEdgeWeight: (editingEdge: { edgeId: string; weight: number; weightInput: string; x: number; y: number } | null) => void;
  handleEditingEdgeKeyDown: (e: React.KeyboardEvent, editingEdge: { edgeId: string; weight: number; weightInput: string; x: number; y: number } | null) => void;
  openEdgeMenu: (event: React.MouseEvent, edgeId: string) => void;
  doAddNode: () => void;
  doDeleteNode: () => void;
  doSetStart: () => void;
  doSetEnd: () => void;
  doStartEdgeCreation: () => void;
  doOpenWeightEditor: () => void;
  doDeleteEdge: () => void;
}

function createEdgePayload(
  sourceId: string,
  targetId: string,
  weighted: boolean
): { id: string; source: string; target: string; weight: number } {
  return {
    id: `e${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    weight: weighted ? Math.floor(Math.random() * 10) + 1 : 1,
  };
}

export function useGraphGestures({
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
}: UseGraphGesturesParams): GraphGestureHandlers {
  const lastPaneClickRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const { graphNodes, graphEdges, directed, weighted, acyclic, isPlayback } = storeData;

  const nextNodeId = useCallback(() => {
    const maxId = graphNodes.reduce((m, nd) => Math.max(m, parseInt(nd.id) || 0), -1);
    return String(maxId + 1);
  }, [graphNodes]);

  const addNodeAtFlowPosition = useCallback(
    (flowX: number, flowY: number) => {
      const id = nextNodeId();
      actions.addNode({ id, label: id, x: flowX, y: flowY });
    },
    [nextNodeId, actions]
  );

  const tryAddEdge = useCallback(
    (sourceId: string, targetId: string) => {
      const exists = graphEdges.some((ed) => ed.source === sourceId && ed.target === targetId);
      if (exists) return;
      const edgePayload = createEdgePayload(sourceId, targetId, weighted);
      actions.addEdge(edgePayload);
      if (acyclic && wouldCreateCycle(graphNodes, graphEdges, directed, sourceId, targetId)) {
        setCycleWarning(true);
        setTimeout(() => setCycleWarning(false), 4000);
      }
    },
    [graphEdges, graphNodes, directed, acyclic, weighted, actions, setCycleWarning]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (edgeSourceId) {
        if (edgeSourceId !== node.id) {
          tryAddEdge(edgeSourceId, node.id);
        }
        setEdgeSourceId(null);
        return;
      }
      if (event.shiftKey && selectedNodeId && selectedNodeId !== node.id) {
        tryAddEdge(selectedNodeId, node.id);
        setSelectedNodeId(node.id);
        return;
      }
      setSelectedNodeId(node.id);
    },
    [edgeSourceId, selectedNodeId, tryAddEdge, setEdgeSourceId, setSelectedNodeId]
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
        addNodeAtFlowPosition(pos.x - NODE_OFFSET, pos.y - NODE_OFFSET);
      } else {
        lastPaneClickRef.current = { time: now, x: event.clientX, y: event.clientY };
        setSelectedNodeId(null);
        if (edgeSourceId) setEdgeSourceId(null);
        setEditingEdge(null);
      }
    },
    [isPlayback, rfInstance, addNodeAtFlowPosition, edgeSourceId, setSelectedNodeId, setEdgeSourceId, setEditingEdge]
  );

  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      if (isPlayback) {
        setCtxMenu({ type: "playback-locked", screenX: event.clientX, screenY: event.clientY });
        return;
      }
      if (!rfInstance) return;
      const pos = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCtxMenu({ type: "pane", screenX: event.clientX, screenY: event.clientY, flowX: pos.x - NODE_OFFSET, flowY: pos.y - NODE_OFFSET });
    },
    [isPlayback, rfInstance, setCtxMenu]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (isPlayback) {
        setCtxMenu({ type: "playback-locked", screenX: event.clientX, screenY: event.clientY });
        return;
      }
      setCtxMenu({ type: "node", screenX: event.clientX, screenY: event.clientY, nodeId: node.id });
    },
    [isPlayback, setCtxMenu]
  );

  const handleEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      if (isPlayback) {
        setCtxMenu({ type: "playback-locked", screenX: event.clientX, screenY: event.clientY });
        return;
      }
      setEditingEdge(null);
      setCtxMenu({ type: "edge", screenX: event.clientX, screenY: event.clientY, edgeId: edge.id });
    },
    [isPlayback, setCtxMenu, setEditingEdge]
  );

  const handleNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (isPlayback) {
        setCtxMenu({ type: "playback-locked", screenX: event.clientX, screenY: event.clientY });
        return;
      }
      setCtxMenu({ type: "node", screenX: event.clientX, screenY: event.clientY, nodeId: node.id });
    },
    [isPlayback, setCtxMenu]
  );

  const openEdgeMenu = useCallback(
    (event: React.MouseEvent, edgeId: string) => {
      if (isPlayback) {
        event.stopPropagation();
        setCtxMenu({ type: "playback-locked", screenX: event.clientX, screenY: event.clientY });
        return;
      }
      if (edgeSourceId) return;
      event.stopPropagation();
      setEditingEdge(null);
      setCtxMenu({ type: "edge", screenX: event.clientX, screenY: event.clientY, edgeId });
    },
    [isPlayback, edgeSourceId, setCtxMenu, setEditingEdge]
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

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (isPlayback) return;
      if (!connection.source || !connection.target || connection.source === connection.target) return;
      tryAddEdge(connection.source, connection.target);
    },
    [isPlayback, tryAddEdge]
  );

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
        actions.updateNodePositions(positionChanges);
      }
    },
    [onNodesChange, actions]
  );

  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (isPlayback) return;
      for (const nd of deleted) {
        actions.removeNode(nd.id);
      }
    },
    [isPlayback, actions]
  );

  const handleApplyEdgeWeight = useCallback(
    (editingEdge: { edgeId: string; weight: number; weightInput: string; x: number; y: number } | null) => {
      if (!editingEdge) return;
      const parsed = parseFloat(editingEdge.weightInput);
      const w = Number.isNaN(parsed) ? editingEdge.weight : parsed;
      actions.updateEdgeWeight({ id: editingEdge.edgeId, weight: w });
      setEditingEdge(null);
    },
    [actions, setEditingEdge]
  );

  const handleEditingEdgeKeyDown = useCallback(
    (e: React.KeyboardEvent, editingEdge: { edgeId: string; weight: number; weightInput: string; x: number; y: number } | null) => {
      if (e.key === "Enter") handleApplyEdgeWeight(editingEdge);
      if (e.key === "Escape") setEditingEdge(null);
    },
    [handleApplyEdgeWeight, setEditingEdge]
  );

  const doAddNode = useCallback(() => {
    if (ctxMenu?.type !== "pane") return;
    addNodeAtFlowPosition(ctxMenu.flowX, ctxMenu.flowY);
    closeMenu();
  }, [ctxMenu, addNodeAtFlowPosition, closeMenu]);

  const doDeleteNode = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    actions.removeNode(ctxMenu.nodeId);
    closeMenu();
  }, [ctxMenu, actions, closeMenu]);

  const doSetStart = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    actions.setStartNode(ctxMenu.nodeId);
    closeMenu();
  }, [ctxMenu, actions, closeMenu]);

  const doSetEnd = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    actions.setEndNode(ctxMenu.nodeId);
    closeMenu();
  }, [ctxMenu, actions, closeMenu]);

  const doStartEdgeCreation = useCallback(() => {
    if (ctxMenu?.type !== "node") return;
    setEdgeSourceId(ctxMenu.nodeId);
    closeMenu();
  }, [ctxMenu, setEdgeSourceId, closeMenu]);

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
  }, [ctxMenu, graphEdges, closeMenu, setEditingEdge]);

  const doDeleteEdge = useCallback(() => {
    if (ctxMenu?.type !== "edge") return;
    actions.removeEdge(ctxMenu.edgeId);
    closeMenu();
  }, [ctxMenu, actions, closeMenu]);

  return {
    handleNodeClick,
    handlePaneClick,
    handlePaneContextMenu,
    handleNodeContextMenu,
    handleEdgeContextMenu,
    handleNodeDoubleClick,
    handleEdgeClick,
    handleEdgeDoubleClick,
    handleConnect,
    handleNodesChange,
    handleNodesDelete,
    handleApplyEdgeWeight,
    handleEditingEdgeKeyDown,
    openEdgeMenu,
    doAddNode,
    doDeleteNode,
    doSetStart,
    doSetEnd,
    doStartEdgeCreation,
    doOpenWeightEditor,
    doDeleteEdge,
  };
}

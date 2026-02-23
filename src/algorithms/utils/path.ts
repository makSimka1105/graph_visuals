import type { NodeVisualState, EdgeVisualState } from "@/types/graph";

export type PrevEntry = { nodeId: string; edgeId: string } | null;

export function reconstructPath(
  prev: Record<string, PrevEntry>,
  start: string,
  end: string
): { nodes: string[]; edges: string[] } | null {
  const pathNodes: string[] = [];
  const pathEdges: string[] = [];
  let current: string | null = end;

  while (current !== null && current !== start) {
    pathNodes.push(current);
    const prevEntry: PrevEntry | undefined = prev[current];
    if (!prevEntry) return null;
    pathEdges.push(prevEntry.edgeId);
    current = prevEntry.nodeId;
  }

  if (current === null) return null;
  pathNodes.push(start);
  pathNodes.reverse();
  pathEdges.reverse();
  return { nodes: pathNodes, edges: pathEdges };
}

export function mergeBidirectionalPath(
  pathFromStart: { nodes: string[]; edges: string[] },
  pathFromEnd: { nodes: string[]; edges: string[] }
): { nodes: string[]; edges: string[] } {
  const tailNodes = [...pathFromEnd.nodes].reverse().slice(1);
  const tailEdges = [...pathFromEnd.edges].reverse();
  return {
    nodes: [...pathFromStart.nodes, ...tailNodes],
    edges: [...pathFromStart.edges, ...tailEdges],
  };
}

export function applyPathToStates(
  path: { nodes: string[]; edges: string[] },
  nodeStates: Record<string, NodeVisualState>,
  edgeStates: Record<string, EdgeVisualState>
) {
  for (const nId of path.nodes) nodeStates[nId] = "path";
  for (const eId of path.edges) edgeStates[eId] = "path";
}

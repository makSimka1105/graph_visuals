import dagre from "@dagrejs/dagre";
import type { GraphNode, GraphEdge } from "@/types/graph";

export function applyLayout(
  nodes: GraphNode[],
  edges: GraphEdge[]
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const n = nodes.length;
  const nodesep = n > 40 ? 50 : n > 20 ? 65 : 80;
  const ranksep = n > 40 ? 60 : n > 20 ? 75 : 90;

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    nodesep,
    ranksep,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of nodes) {
    g.setNode(node.id, { width: 36, height: 36 });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, x: pos.x - 18, y: pos.y - 18 };
  });

  return { nodes: layoutNodes, edges };
}

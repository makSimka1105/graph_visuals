import type { GraphNode, GraphEdge } from "@/types/graph";

export function parseAdjacencyList(
  input: string,
  directed: boolean,
  weighted: boolean
): { nodes: GraphNode[]; edges: GraphEdge[] } | null {
  const lines = input
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  const nodeIds = new Set<string>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (const line of lines) {
    const parts = line.split(/\s+/);
    if (parts.length < 2) continue;

    const src = parts[0];
    const tgt = parts[1];
    const w = parts.length >= 3 ? parseFloat(parts[2]) : 1;

    nodeIds.add(src);
    nodeIds.add(tgt);

    const key = directed ? `${src}-${tgt}` : [src, tgt].sort().join("-");
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({
        id: `e${src}-${tgt}`,
        source: src,
        target: tgt,
        weight: weighted ? w : undefined,
      });
    }
  }

  const nodes: GraphNode[] = Array.from(nodeIds).map((id) => ({
    id,
    label: id,
  }));

  return { nodes, edges };
}

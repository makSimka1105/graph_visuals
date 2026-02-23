import type { GraphNode, GraphEdge } from "@/types/graph";

export interface PresetTags {
  directed?: boolean;
  weighted?: boolean;
  acyclic?: boolean;
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  tags: PresetTags;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

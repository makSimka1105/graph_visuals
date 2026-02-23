import type { Preset, PresetTags } from "./types";
import { generalPresets } from "./general";
import { treePresets } from "./trees";
import { dagPresets } from "./dags";
import { directedPresets } from "./directed";
import { negativePresets } from "./negative";
import { largePresets } from "./large";

const allPresets: Preset[] = [
  ...generalPresets,
  ...treePresets,
  ...dagPresets,
  ...directedPresets,
  ...negativePresets,
  ...largePresets,
];

export type { Preset, PresetTags };

export const presetList = allPresets.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  tags: p.tags,
}));

export function getPreset(id: string): Preset | undefined {
  return allPresets.find((p) => p.id === id);
}

export function getRecommendedCategoryLabel(directed: boolean, acyclic: boolean): string {
  if (acyclic && directed) return "DAGs";
  if (acyclic && !directed) return "Trees";
  if (directed) return "Cyclical";
  return "General";
}

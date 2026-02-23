import type { AlgorithmDefinition } from "@/types/graph";

const registry = new Map<string, AlgorithmDefinition>();

export function registerAlgorithm(def: AlgorithmDefinition) {
  registry.set(def.id, def);
}

export function getAlgorithm(id: string): AlgorithmDefinition | undefined {
  return registry.get(id);
}

export function getAllAlgorithms(): AlgorithmDefinition[] {
  return Array.from(registry.values());
}

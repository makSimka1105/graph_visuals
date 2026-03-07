import type { AlgorithmStep } from "@/types/graph";

export interface AuxiliaryDisplayDescriptor {
  id: string;
  order: number;
  hasData: (step: AlgorithmStep | null) => boolean;
  Component: React.ComponentType<{ step: AlgorithmStep }>;
}

const registry: AuxiliaryDisplayDescriptor[] = [];

export function registerAuxiliaryDisplay(descriptor: AuxiliaryDisplayDescriptor): void {
  const exists = registry.some((d) => d.id === descriptor.id);
  if (exists) return;
  registry.push(descriptor);
  registry.sort((a, b) => a.order - b.order);
}

export function getAuxiliaryDisplays(): readonly AuxiliaryDisplayDescriptor[] {
  return registry;
}

export function hasAnyAuxiliaryContent(step: AlgorithmStep | null): boolean {
  if (!step) return false;
  return registry.some((d) => d.hasData(step));
}

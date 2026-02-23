import type { PriorityQueueItem } from "@/types/graph";

export function createPriorityQueue() {
  const pq: PriorityQueueItem[] = [];

  function addOrUpdate(priority: number, nodeId: string) {
    const idx = pq.findIndex((item) => item.nodeId === nodeId);
    if (idx >= 0) {
      if (priority < pq[idx].dist) pq[idx].dist = priority;
    } else {
      pq.push({ dist: priority, nodeId });
    }
  }

  function extractMin(): PriorityQueueItem | null {
    if (pq.length === 0) return null;
    pq.sort((a, b) => a.dist - b.dist);
    return pq.shift()!;
  }

  function toSortedArray(): PriorityQueueItem[] {
    return [...pq].sort((a, b) => a.dist - b.dist);
  }

  return { addOrUpdate, extractMin, toSortedArray };
}

export function roundForDisplay(x: number): number {
  return Math.round(x * 10) / 10;
}

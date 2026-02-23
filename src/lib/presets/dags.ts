import type { Preset } from "./types";
import { n, e, seededRand } from "./utils";

export const dagPresets: Preset[] = [
  {
    id: "layered-dag",
    name: "Layered DAG (20)",
    category: "DAGs",
    tags: { directed: true, acyclic: true, weighted: true },
    nodes: (() => {
      const rng = seededRand(7777);
      const layers = [[0], [1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11, 12], [13, 14, 15, 16], [17, 18], [19]];
      const out: import("@/types/graph").GraphNode[] = [];
      let y = 0;
      for (const layer of layers) {
        const w = layer.length * 110;
        const startX = (650 - w) / 2;
        for (let i = 0; i < layer.length; i++) {
          const jx = (rng() - 0.5) * 30;
          const jy = (rng() - 0.5) * 20;
          out.push(n(layer[i], Math.round(startX + i * 110 + 55 + jx), Math.round(y + jy)));
        }
        y += 82;
      }
      return out;
    })(),
    edges: [
      e(0, 1, 3), e(0, 2, 2), e(0, 3, 5),
      e(1, 4, 1), e(1, 5, 4), e(2, 5, 2), e(2, 6, 3), e(3, 6, 1), e(3, 7, 6),
      e(4, 8, 2), e(4, 9, 5), e(5, 9, 1), e(5, 10, 3), e(6, 10, 4), e(6, 11, 2), e(7, 11, 1), e(7, 12, 3),
      e(8, 13, 4), e(9, 13, 2), e(9, 14, 3), e(10, 14, 1), e(10, 15, 5), e(11, 15, 2), e(12, 16, 4),
      e(13, 17, 3), e(14, 17, 1), e(14, 18, 4), e(15, 18, 2), e(16, 18, 3),
      e(17, 19, 2), e(18, 19, 1),
      e(1, 9, 7), e(3, 12, 8), e(0, 5, 9), e(5, 14, 6), e(8, 17, 5),
      e(2, 7, 4), e(11, 16, 3),
    ],
  },
];

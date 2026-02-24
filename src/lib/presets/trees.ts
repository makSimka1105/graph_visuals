import type { Preset } from "./types";
import { n, e, seededRand } from "./utils";

export const treePresets: Preset[] = [
  {
    id: "tree",
    name: "Tree (16)",
    category: "Trees",
    tags: { acyclic: true, weighted: true },
    nodes: (() => {
      const rng = seededRand(111);
      const positions = [
        [280, 0],
        [140, 90], [420, 85],
        [70, 185], [210, 180], [350, 185], [530, 175],
        [35, 280], [105, 275], [175, 285], [245, 270], [315, 280], [385, 275], [455, 285], [565, 270],
        [140, 370],
      ];
      return positions.map((p, i) =>
        n(i, Math.round(p[0] + (rng() - 0.5) * 15), Math.round(p[1] + (rng() - 0.5) * 10))
      );
    })(),
    edges: [
      e(0, 1, 2), e(0, 2, 5),
      e(1, 3, 1), e(1, 4, 3), e(2, 5, 4), e(2, 6, 2),
      e(3, 7, 2), e(3, 8, 4), e(4, 9, 1), e(4, 10, 3), e(5, 11, 5), e(5, 12, 2), e(6, 13, 1), e(6, 14, 4),
      e(7, 15, 6),
    ],
  },


];

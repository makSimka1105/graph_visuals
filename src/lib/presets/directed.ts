import type { Preset } from "./types";
import { n, e, seededRand } from "./utils";

export const directedPresets: Preset[] = [
  {
    id: "diamond-cyclical",
    name: "Diamond Cyclical (6)",
    category: "Cyclical",
    tags: { directed: true, weighted: true },
    nodes: [
      n("S", 0, 130), n("A", 160, 10), n("B", 140, 260),
      n("C", 310, 100), n("D", 280, 290), n("T", 460, 140),
    ],
    edges: [
      e("S", "A", 1), e("S", "B", 4), e("A", "C", 2), e("B", "C", 1),
      e("A", "D", 6), e("C", "T", 3), e("D", "T", 1), e("B", "D", 2),
      e("A", "S", 2), e("C", "A", 3), e("T", "C", 2),
    ],
  },

  {
    id: "network-cyclical",
    name: "Network Cyclical (20)",
    category: "Cyclical",
    tags: { directed: true, weighted: true },
    nodes: (() => {
      const rng = seededRand(42);
      const positions = [
        [20, 150], [90, 50], [80, 260], [185, 30], [175, 155],
        [160, 245], [290, 10], [275, 125], [265, 235], [280, 360],
        [390, 55], [385, 165], [370, 290], [475, 25], [480, 130],
        [460, 240], [475, 370], [560, 75], [570, 210], [560, 330],
      ];
      const out: import("@/types/graph").GraphNode[] = [];
      for (let i = 0; i < 20; i++) {
        const jx = (rng() - 0.5) * 30;
        const jy = (rng() - 0.5) * 30;
        out.push(n(i, Math.round(positions[i][0] + jx), Math.round(positions[i][1] + jy)));
      }
      return out;
    })(),
    edges: [
      e(0, 1, 2), e(0, 2, 3), e(1, 3, 1), e(1, 4, 4), e(2, 4, 2), e(2, 5, 3),
      e(3, 6, 5), e(3, 7, 2), e(4, 7, 1), e(4, 8, 3), e(5, 8, 4), e(5, 9, 2),
      e(6, 10, 3), e(7, 10, 1), e(7, 11, 5), e(8, 11, 2), e(8, 12, 4), e(9, 12, 1),
      e(10, 13, 2), e(10, 14, 3), e(11, 14, 1), e(11, 15, 4), e(12, 15, 2), e(12, 16, 3),
      e(13, 17, 1), e(14, 17, 5), e(14, 18, 2), e(15, 18, 3), e(15, 19, 1), e(16, 19, 4),
      e(0, 4, 6), e(1, 7, 8), e(2, 9, 7), e(3, 10, 4), e(6, 13, 3), e(5, 12, 5), e(9, 16, 6), e(4, 11, 9), e(7, 14, 3), e(13, 18, 7),
      e(4, 0, 5), e(7, 4, 2), e(10, 7, 3), e(14, 11, 4), e(18, 15, 3),
    ],
  },

  {
    id: "islands-cyclical",
    name: "Islands Cyclical (15)",
    category: "Cyclical",
    tags: { directed: true, weighted: true },
    nodes: [
      n(0, 30, 55), n(1, 145, 10), n(2, 85, 140), n(3, 210, 110), n(4, 20, 210),
      n(5, 370, 35), n(6, 460, 15), n(7, 420, 140), n(8, 510, 130), n(9, 350, 185),
      n(10, 100, 320), n(11, 245, 275), n(12, 180, 395), n(13, 350, 350), n(14, 400, 255),
    ],
    edges: [
      e(0, 1, 2), e(0, 2, 3), e(1, 3, 1), e(2, 3, 4), e(2, 4, 2), e(0, 4, 5),
      e(1, 2, 6), e(2, 0, 2), e(3, 1, 2),
      e(5, 6, 3), e(5, 7, 2), e(6, 8, 1), e(7, 8, 4), e(7, 9, 2), e(5, 9, 3),
      e(6, 9, 5), e(8, 6, 2), e(9, 5, 4),
      e(10, 11, 2), e(10, 12, 4), e(11, 13, 3), e(12, 13, 1), e(13, 14, 2), e(11, 14, 5),
      e(10, 13, 7), e(13, 10, 5),
      e(3, 9, 7), e(4, 10, 6), e(14, 8, 8), e(3, 5, 9), e(11, 7, 10),
    ],
  },
];

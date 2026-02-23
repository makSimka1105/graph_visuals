import type { Preset } from "./types";
import { n, e } from "./utils";

export const negativePresets: Preset[] = [
  {
    id: "negative-weight",
    name: "Negative Weights (8)",
    category: "Negative weights",
    tags: { directed: true, weighted: true },
    nodes: [
      n(0, 10, 110), n(1, 150, 10), n(2, 130, 220), n(3, 300, 55),
      n(4, 290, 175), n(5, 440, 15), n(6, 430, 210), n(7, 580, 110),
    ],
    edges: [
      e(0, 1, 4), e(0, 2, 5), e(1, 3, -2), e(2, 4, 3),
      e(3, 4, 1), e(3, 5, 6), e(4, 6, -3), e(5, 7, 2), e(6, 7, 4),
      e(1, 4, 7), e(2, 3, -1),
    ],
  },

  {
    id: "negative-diamond",
    name: "Negative Diamond (6)",
    category: "Negative weights",
    tags: { directed: true, weighted: true },
    nodes: [
      n("S", 0, 130), n("A", 160, 10), n("B", 140, 260),
      n("C", 310, 100), n("D", 280, 290), n("T", 460, 140),
    ],
    edges: [
      e("S", "A", 1), e("S", "B", 4), e("A", "C", -1), e("B", "C", 1),
      e("A", "D", 6), e("C", "T", 3), e("D", "T", -2), e("B", "D", 2),
    ],
  },

  {
    id: "negative-islands",
    name: "Negative Islands (12)",
    category: "Negative weights",
    tags: { directed: true, weighted: true },
    nodes: [
      n(0, 80, 80), n(1, 180, 40), n(2, 160, 140),
      n(3, 350, 60), n(4, 420, 120), n(5, 380, 180),
      n(6, 120, 260), n(7, 220, 240), n(8, 180, 320),
      n(9, 350, 280), n(10, 420, 320), n(11, 280, 380),
    ],
    edges: [
      e(0, 1, 2), e(0, 2, 3), e(1, 2, -1), e(2, 0, 2),
      e(1, 3, 4), e(2, 4, 2), e(3, 4, -2), e(4, 5, 3),
      e(2, 6, 5), e(6, 7, 1), e(7, 8, -1), e(8, 6, 2),
      e(5, 9, 4), e(7, 9, 3), e(9, 10, -2), e(10, 11, 2),
      e(3, 9, 6), e(6, 9, 7),
    ],
  },
];

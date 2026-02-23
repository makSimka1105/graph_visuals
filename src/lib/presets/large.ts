import type { Preset } from "./types";
import { n, e, seededRand } from "./utils";

function buildTexasMap(): Preset {
  const rng = seededRand(7419);
  const j = (x: number, y: number) => [
    Math.round(x + (rng() - 0.5) * 6),
    Math.round(y + (rng() - 0.5) * 6),
  ];
  const scale = 1.6;

  const isle1 = [
    j(45 * scale, 55 * scale), j(85 * scale, 30 * scale), j(120 * scale, 50 * scale), j(95 * scale, 85 * scale), j(60 * scale, 110 * scale),
  ];
  const isle2 = [
    j(300 * scale, 60 * scale), j(360 * scale, 55 * scale), j(390 * scale, 95 * scale), j(350 * scale, 125 * scale), j(300 * scale, 100 * scale),
  ];
  const isle3 = [
    j(600 * scale, 120 * scale), j(570 * scale, 85 * scale), j(520 * scale, 115 * scale), j(500 * scale, 155 * scale), j(560 * scale, 155 * scale),
  ];
  const diamond = [
    j(220 * scale, 260 * scale), j(300 * scale, 210 * scale), j(280 * scale, 300 * scale), j(380 * scale, 250 * scale), j(360 * scale, 320 * scale), j(390 * scale, 420 * scale),
  ];
  const scattered = [
    j(50 * scale, 320 * scale), j(130 * scale, 350 * scale), j(180 * scale, 310 * scale), j(170 * scale, 340 * scale), j(120 * scale, 400 * scale), j(220 * scale, 350 * scale),
  ];

  const allPos = [...isle1, ...isle2, ...isle3, ...diamond, ...scattered];
  const nodes = allPos.map((p, i) => n(i, p[0], p[1]));

  const edges: ReturnType<typeof e>[] = [];
  const add = (a: number, b: number, w: number) => edges.push(e(a, b, w));

  add(0, 1, 2); add(1, 2, 1); add(2, 3, 3); add(3, 4, 2); add(4, 0, 2); add(1, 4, 4);
  add(5, 6, 2); add(6, 7, 1); add(7, 8, 3); add(8, 9, 2); add(9, 5, 2); add(6, 9, 4);
  add(10, 11, 2); add(11, 12, 1); add(12, 13, 3); add(13, 14, 2); add(14, 10, 2); add(11, 14, 4);
  add(15, 16, 1); add(15, 17, 4); add(16, 18, 2); add(17, 18, 1); add(16, 19, 6); add(18, 20, 3); add(19, 20, 1); add(17, 19, 2);
  add(21, 22, 3); add(22, 23, 2); add(23, 24, 4); add(24, 25, 2); add(25, 21, 5); add(22, 25, 3);
  add(24, 26, 2);
  add(0, 21, 8); add(4, 21, 7); add(2, 5, 9); add(4, 9, 10);
  add(5, 15, 6); add(9, 16, 7); add(7, 18, 8);
  add(10, 20, 5); add(14, 20, 6); add(12, 7, 9);
  add(15, 21, 7); add(17, 23, 8); add(19, 25, 9); add(20, 25, 10);

  return {
    id: "texas-map",
    name: "Texas Map (~27)",
    category: "Large",
    tags: { weighted: true },
    nodes,
    edges,
  };
}

export const largePresets: Preset[] = [
  buildTexasMap(),
];
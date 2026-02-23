import type { GraphNode, GraphEdge } from "@/types/graph";

export interface GenerateOptions {
  nodeCount: number;
  edgeCount: number;
  directed: boolean;
  weighted: boolean;
  acyclic: boolean;
}

export function edgeLimits(nodeCount: number, directed: boolean, acyclic: boolean) {
  const n = nodeCount;
  const min = n - 1;
  let max: number;
  if (acyclic) {
    max = (n * (n - 1)) / 2;
  } else if (directed) {
    max = n * (n - 1);
  } else {
    max = (n * (n - 1)) / 2;
  }
  max = Math.min(max, n * 4);
  return { min, max };
}

export function generateRandomGraph(opts: GenerateOptions): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const { nodeCount, directed, weighted, acyclic } = opts;
  const limits = edgeLimits(nodeCount, directed, acyclic);
  const targetEdges = Math.max(limits.min, Math.min(opts.edgeCount, limits.max));

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ id: String(i), label: String(i), x: 0, y: 0 });
  }

  if (acyclic) {
    buildAcyclicEdges(nodeCount, targetEdges, weighted, edges, edgeSet);
  } else {
    buildGeneralEdges(nodeCount, targetEdges, directed, weighted, edges, edgeSet);
  }

  const adj = buildAdjacency(nodeCount, edges);

  const spacing = adaptiveSpacing(nodeCount);
  const initial = computeRingPositions(nodeCount, spacing);
  for (let i = 0; i < nodeCount; i++) {
    nodes[i].x = initial[i].x;
    nodes[i].y = initial[i].y;
  }

  forceDirectedRefine(nodes, adj, spacing);

  return { nodes, edges };
}

function adaptiveSpacing(n: number): number {
  if (n <= 8) return 90;
  if (n <= 15) return 75;
  if (n <= 25) return 60;
  if (n <= 40) return 50;
  if (n <= 60) return 42;
  return 36;
}

function buildAdjacency(n: number, edges: GraphEdge[]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const e of edges) {
    const s = parseInt(e.source), t = parseInt(e.target);
    adj[s].push(t);
    adj[t].push(s);
  }
  return adj;
}

function forceDirectedRefine(nodes: GraphNode[], adj: number[][], baseSpacing: number) {
  const n = nodes.length;
  if (n <= 2) return;

  const idealDist = baseSpacing * 1.2;
  const iterations = Math.min(200, 40 + n * 2);
  const coolingRate = 0.97;
  let temperature = idealDist * 2;

  for (let iter = 0; iter < iterations; iter++) {
    const fx = new Float64Array(n);
    const fy = new Float64Array(n);

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = (nodes[i].x ?? 0) - (nodes[j].x ?? 0);
        const dy = (nodes[i].y ?? 0) - (nodes[j].y ?? 0);
        const distSq = dx * dx + dy * dy + 0.01;
        const dist = Math.sqrt(distSq);
        const force = (idealDist * idealDist) / dist;
        const fdx = (dx / dist) * force;
        const fdy = (dy / dist) * force;
        fx[i] += fdx; fy[i] += fdy;
        fx[j] -= fdx; fy[j] -= fdy;
      }
    }

    for (let i = 0; i < n; i++) {
      for (const j of adj[i]) {
        if (j <= i) continue;
        const dx = (nodes[i].x ?? 0) - (nodes[j].x ?? 0);
        const dy = (nodes[i].y ?? 0) - (nodes[j].y ?? 0);
        const dist = Math.sqrt(dx * dx + dy * dy + 0.01);
        const force = (dist * dist) / idealDist;
        const fdx = (dx / dist) * force;
        const fdy = (dy / dist) * force;
        fx[i] -= fdx; fy[i] -= fdy;
        fx[j] += fdx; fy[j] += fdy;
      }
    }

    for (let i = 0; i < n; i++) {
      const mag = Math.sqrt(fx[i] * fx[i] + fy[i] * fy[i]) + 0.01;
      const cap = Math.min(mag, temperature);
      nodes[i].x = Math.round((nodes[i].x ?? 0) + (fx[i] / mag) * cap);
      nodes[i].y = Math.round((nodes[i].y ?? 0) + (fy[i] / mag) * cap);
    }

    temperature *= coolingRate;
  }

  const minX = Math.min(...nodes.map((n) => n.x ?? 0));
  const minY = Math.min(...nodes.map((n) => n.y ?? 0));
  for (const node of nodes) {
    node.x = (node.x ?? 0) - minX + 20;
    node.y = (node.y ?? 0) - minY + 20;
  }
}

function buildAcyclicEdges(
  n: number, target: number, weighted: boolean,
  edges: GraphEdge[], edgeSet: Set<string>
) {
  const addEdge = (s: number, t: number) => {
    const [a, b] = s < t ? [s, t] : [t, s];
    const key = `${a}-${b}`;
    if (edgeSet.has(key)) return false;
    edgeSet.add(key);
    edges.push({
      id: `e${a}-${b}`, source: String(a), target: String(b),
      weight: weighted ? Math.floor(Math.random() * 15) + 1 : 1,
    });
    return true;
  };
  for (let i = 0; i < n - 1; i++) addEdge(i, i + 1);
  let attempts = 0;
  while (edges.length < target && attempts < target * 5) {
    attempts++;
    const a = Math.floor(Math.random() * n);
    const b = Math.floor(Math.random() * n);
    if (a === b) continue;
    addEdge(Math.min(a, b), Math.max(a, b));
  }
}

function buildGeneralEdges(
  n: number, target: number, directed: boolean, weighted: boolean,
  edges: GraphEdge[], edgeSet: Set<string>
) {
  const addEdge = (s: number, t: number) => {
    const key = directed ? `${s}-${t}` : `${Math.min(s, t)}-${Math.max(s, t)}`;
    if (edgeSet.has(key)) return false;
    edgeSet.add(key);
    edges.push({
      id: `e${s}-${t}`, source: String(s), target: String(t),
      weight: weighted ? Math.floor(Math.random() * 15) + 1 : 1,
    });
    return true;
  };
  const shuffled = [...Array(n).keys()].sort(() => Math.random() - 0.5);
  for (let i = 1; i < shuffled.length; i++) addEdge(shuffled[i - 1], shuffled[i]);
  let attempts = 0;
  while (edges.length < target && attempts < target * 5) {
    attempts++;
    const a = Math.floor(Math.random() * n);
    const b = Math.floor(Math.random() * n);
    if (a === b) continue;
    addEdge(a, b);
  }
}

function computeRingPositions(n: number, spacing: number): { x: number; y: number }[] {
  if (n <= 1) return [{ x: 0, y: 0 }];
  const positions: { x: number; y: number }[] = [];
  const ringGap = spacing * 1.1;
  let placed = 0, ring = 0;
  if (n <= 20) { positions.push({ x: 0, y: 0 }); placed = 1; ring = 1; }
  while (placed < n) {
    const radius = ring * ringGap;
    const circumference = 2 * Math.PI * Math.max(radius, 1);
    const nodesInRing = ring === 0 ? 1 : Math.min(Math.floor(circumference / spacing), n - placed);
    for (let i = 0; i < nodesInRing && placed < n; i++) {
      const angle = (i * 2 * Math.PI) / nodesInRing - Math.PI / 2;
      positions.push({ x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) });
      placed++;
    }
    ring++;
  }
  const minX = Math.min(...positions.map((p) => p.x));
  const minY = Math.min(...positions.map((p) => p.y));
  return positions.map((p) => ({ x: p.x - minX, y: p.y - minY }));
}

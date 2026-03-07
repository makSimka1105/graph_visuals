"use client";

import type { AlgorithmStep } from "@/types/graph";

export function hasKosarajuExitIndicesData(step: AlgorithmStep | null): boolean {
  return Boolean(step?.data?.kosarajuExitIndices);
}

interface KosarajuExitIndicesSlotProps {
  step: AlgorithmStep;
}

const PHASE_LABELS: Record<string, string> = {
  dfs1: "Phase 1: DFS (exit indices)",
  dfs2: "Phase 2: DFS on reversed graph",
};

function formatIndex(val: number): string {
  return val === Infinity ? "-" : String(val);
}

export function KosarajuExitIndicesSlot({ step }: KosarajuExitIndicesSlotProps) {
  const data = step.data?.kosarajuExitIndices;
  if (!data) return null;

  const { nodeIds, exitIndices, currentVertex, currentIndex, phase } = data;

  return (
    <div className="flex flex-col gap-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 min-w-0 max-w-full overflow-auto">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">
          Exit indices
        </span>
        <span className="text-xs font-medium text-amber-400">
          {PHASE_LABELS[phase] ?? phase}
        </span>
        {currentIndex !== undefined && (
          <span className="text-xs font-mono text-blue-400">
            Current index: <strong>{currentIndex}</strong>
          </span>
        )}

      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono font-medium">
          <thead>
            <tr>
              <th className="px-1 py-0.5 text-zinc-500 font-medium text-left w-12">Indices</th>
              {nodeIds.map((id) => {
                const val = exitIndices[id] ?? Infinity;
                const isCurrent = currentVertex === id;
                return (
                  <th
                    key={id}
                    className={`px-1.5 py-0.5 text-center tabular-nums min-w-[28px] ${
                      isCurrent ? "bg-blue-900/50 text-blue-300" : "text-zinc-400"
                    }`}
                    title={id}
                  >
                    {formatIndex(val)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-1 py-0.5 text-zinc-500 font-medium">Vertices</td>
              {nodeIds.map((id) => {
                const isCurrent = currentVertex === id;
                return (
                  <td
                    key={id}
                    className={`px-1.5 py-0.5 text-center truncate max-w-[32px] ${
                      isCurrent
                        ? "bg-blue-800/60 text-blue-200 border border-blue-700/50 font-semibold"
                        : "bg-zinc-800/40 text-zinc-300 border border-zinc-700/40"
                    }`}
                    title={id}
                  >
                    {id}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

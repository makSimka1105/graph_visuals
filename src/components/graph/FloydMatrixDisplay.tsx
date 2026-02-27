"use client";

import type { FloydMatrixData } from "@/types/graph";

interface FloydMatrixDisplayProps {
  data: FloydMatrixData;
}

function formatCell(value: number): string {
  return value === Infinity ? "∞" : String(value);
}

export function FloydMatrixDisplay({ data }: FloydMatrixDisplayProps) {
  const { matrix, nodeIds, phaseIndex, updatedInPhase } = data;
  const updatedSet = new Set(updatedInPhase);
  const n = nodeIds.length;

  if (n === 0) return null;

  const showPhaseHighlight = phaseIndex >= 0;

  return (
    <div className="flex flex-col gap-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 min-w-0 max-w-full overflow-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Distance matrix
          </span>
          <span className="text-xs font-medium text-amber-400">
            {phaseIndex >= 0 ? `Phase k = ${nodeIds[phaseIndex]} (${phaseIndex + 1}/${n})` : "Initial"}
          </span>
        </div>
        {showPhaseHighlight && (
          <p className="text-[9px] text-zinc-500">
            Checking all pairs (i,j): dist(i,j) = min(dist(i,j), dist(i,k) + dist(k,j)). Order: k=0..n−1 (fixed).
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse text-[10px] font-mono">
          <thead>
            <tr>
              <th className="p-0.5 w-6 text-zinc-500 font-normal" />
              {nodeIds.map((id, j) => (
                <th
                  key={id}
                  className={`px-1 py-0.5 text-zinc-400 font-normal truncate max-w-[28px] ${
                    showPhaseHighlight && j === phaseIndex ? "bg-zinc-700/50 text-zinc-300" : ""
                  }`}
                  title={id}
                >
                  {id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr
                key={i}
                className={showPhaseHighlight && i === phaseIndex ? "bg-zinc-800/20" : ""}
              >
                <td
                  className={`px-0.5 py-0.5 text-zinc-400 font-normal truncate max-w-[28px] ${
                    showPhaseHighlight && i === phaseIndex ? "bg-zinc-700/50 text-zinc-300" : ""
                  }`}
                  title={nodeIds[i]}
                >
                  {nodeIds[i]}
                </td>
                {row.map((val, j) => {
                  const key = `${i},${j}`;
                  const isUpdated = updatedSet.has(key);
                  const isPhaseRow = showPhaseHighlight && i === phaseIndex;
                  const isPhaseCol = showPhaseHighlight && j === phaseIndex;
                  const isVertexK = isPhaseRow && isPhaseCol;
                  const isPhaseLine = (isPhaseRow || isPhaseCol) && !isVertexK;
                  const baseUpdated = "bg-red-950/60 text-red-300 border border-red-800/50";
                  const baseUnchanged = "bg-sky-950/30 text-sky-300/90 border border-sky-900/40";
                  const brighterUpdated = "bg-red-900/70 text-red-300 border border-red-700/50";
                  const brighterUnchanged = "bg-sky-900/50 text-sky-300 border border-sky-800/40";
                  return (
                    <td
                      key={key}
                      className={`px-1 py-0.5 text-center tabular-nums min-w-[24px] ${
                        isVertexK
                          ? isUpdated
                            ? "bg-red-800/75 text-red-200 border border-red-700/60 font-semibold"
                            : "bg-sky-800/55 text-sky-200 border border-sky-700/50 font-semibold"
                          : isPhaseLine
                            ? isUpdated
                              ? brighterUpdated
                              : brighterUnchanged
                            : isUpdated
                              ? baseUpdated
                              : baseUnchanged
                      }`}
                    >
                      {formatCell(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-950/50 border border-sky-800/50" />
          Unchanged
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-950/50 border border-red-800/50" />
          Updated
        </span>
        {showPhaseHighlight && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-800/60 border border-sky-700/50" />
            Vertex k (row & col)
          </span>
        )}
      </div>
    </div>
  );
}

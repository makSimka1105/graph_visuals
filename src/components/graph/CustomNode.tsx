"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { NodeVisualState } from "@/types/graph";
import { SCC_PALETTE } from "@/lib/sccColors";

const stateStyles: Record<NodeVisualState, { bg: string; border: string; text: string }> = {
  default:  { bg: "bg-zinc-900",  border: "border-zinc-500", text: "text-zinc-100" },
  visited:  { bg: "bg-zinc-800",  border: "border-zinc-600", text: "text-zinc-500" },
  current:  { bg: "bg-blue-600",  border: "border-blue-400", text: "text-white" },
  inQueue:  { bg: "bg-yellow-600", border: "border-yellow-400", text: "text-white" },
  path:     { bg: "bg-emerald-600", border: "border-emerald-400", text: "text-white" },
  start:    { bg: "bg-violet-600", border: "border-violet-400", text: "text-white" },
  end:      { bg: "bg-rose-600",   border: "border-rose-400", text: "text-white" },
  currentBackward:  { bg: "bg-fuchsia-600", border: "border-fuchsia-400", text: "text-white" },
  inQueueBackward:  { bg: "bg-amber-600",   border: "border-amber-400",  text: "text-white" },
  visitedBackward:  { bg: "bg-zinc-700",    border: "border-zinc-500",   text: "text-zinc-400" },
  inTree:   { bg: "bg-emerald-600", border: "border-emerald-400", text: "text-white" },
};

type CustomNodeData = {
  label: string;
  visualState?: NodeVisualState;
  isEdgeSource?: boolean;
  distance?: number;
  distanceLabel?: "distance" | "exitIndex";
  title?: string;
  sccColorIndex?: number;
};

function CustomNodeComponent({ data, selected }: NodeProps) {
  const nodeData = (data ?? {}) as CustomNodeData;
  const state = nodeData.visualState ?? "default";
  const sccIndex = nodeData.sccColorIndex;
  const styles =
    sccIndex !== undefined
      ? SCC_PALETTE[sccIndex % SCC_PALETTE.length]
      : stateStyles[state];
  const isEdgeSource = nodeData.isEdgeSource ?? false;
  const distance = nodeData.distance;
  const distanceLabel = nodeData.distanceLabel ?? "distance";
  const animClass = (state === "current" || state === "currentBackward") ? "node-current" : (state === "path" || state === "inTree") ? "node-path" : "";

  const highlightBorder = isEdgeSource
    ? "border-sky-400 ring-2 ring-sky-400/60"
    : selected
      ? "border-sky-400 ring-2 ring-sky-400/40"
      : "";

  return (
    <div className="relative group" title={nodeData.title}>
      <Handle
        type="target"
        position={Position.Top}
        className="!opacity-0 !w-0 !h-0 !min-w-0 !min-h-0 !border-0"
        style={{ top: "50%", left: "50%" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0 !w-0 !h-0 !min-w-0 !min-h-0 !border-0"
        style={{ top: "50%", left: "50%" }}
      />
      <div
        className={`
          flex items-center justify-center
          rounded-full
          w-9 h-9
          border-2 ${highlightBorder || styles.border} ${styles.bg} ${styles.text}
          font-mono font-bold text-xs
          shadow-lg shadow-black/30
          transition-all duration-200 ease-out
          ${animClass}
          group-hover:scale-[1.08] group-hover:shadow-sky-400/20 group-hover:shadow-xl
          group-hover:${styles.border}
        `}
      >
        {nodeData.label}
      </div>
      {distance !== undefined && (
        <span
          className={`
            absolute top-5 left-7 -translate-x-1/2 mt-1
            text-[8px] font-mono font-bold px-1 py-0.3 rounded border-2 whitespace-nowrap
            transition-all duration-200 ease-out
            ${styles.bg} ${styles.border} ${styles.text}
            group-hover:scale-[1.05] group-hover:shadow-sky-400/20 group-hover:shadow-lg
            group-hover:${styles.border} group-hover:${styles.text}
          `}
          title={distanceLabel === "exitIndex" ? "Exit index" : "Shortest distance"}
        >
          {distance === Infinity
            ? distanceLabel === "exitIndex"
              ? "-"
              : "inf"
            : distance}
        </span>
      )}
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);

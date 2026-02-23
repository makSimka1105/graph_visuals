"use client";

import { memo, useState } from "react";
import {
  EdgeLabelRenderer,
  type EdgeProps,
} from "@xyflow/react";
import type { EdgeVisualState } from "@/types/graph";

const edgeColors: Record<EdgeVisualState, string> = {
  default: "#71717a",
  traversed: "#6b7280",
  current: "#3b82f6",
  path: "#22c55e",
  traversedBackward: "#9ca3af",
  currentBackward: "#d946ef",
};

const edgeWidths: Record<EdgeVisualState, number> = {
  default: 1.5,
  traversed: 2,
  current: 3,
  path: 3,
  traversedBackward: 2,
  currentBackward: 3,
};

const SELECTED_OUT_COLOR = "#38bdf8";
const SELECTED_IN_COLOR = "#38bdf8";
const SELECTED_IN_OPACITY = 0.35;
const HOVER_COLOR = "#7dd3fc";
const HOVER_WIDTH = 3;
const SELECTED_WIDTH = 2.5;
const SELECTED_IN_WIDTH = 2;

type CustomEdgeData = {
  weight?: number;
  visualState?: EdgeVisualState;
  directed?: boolean;
  selectedNodeId?: string | null;
  onEdgeClick?: (event: React.MouseEvent) => void;
};

const NODE_RADIUS = 20;

function CustomEdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const edgeData = (data ?? {}) as CustomEdgeData;
  const state = edgeData?.visualState ?? "default";
  const directed = edgeData?.directed ?? false;
  const selectedNodeId = edgeData?.selectedNodeId;
  const [hovered, setHovered] = useState(false);

  const isOutgoing = selectedNodeId != null && source === selectedNodeId;
  const isIncoming = selectedNodeId != null && target === selectedNodeId;

  let color: string;
  let width: number;
  let opacity = 1;

  const isActiveAlgState = state === "current" || state === "currentBackward" || state === "path";
  const isPassiveAlgState = state === "traversed" || state === "traversedBackward";

  if (isActiveAlgState) {
    color = edgeColors[state];
    width = edgeWidths[state];
  } else if (hovered) {
    color = HOVER_COLOR;
    width = HOVER_WIDTH;
  } else if (isOutgoing || (!directed && isIncoming)) {
    color = SELECTED_OUT_COLOR;
    width = SELECTED_WIDTH;
  } else if (directed && isIncoming) {
    color = SELECTED_IN_COLOR;
    width = SELECTED_IN_WIDTH;
    opacity = SELECTED_IN_OPACITY;
  } else if (isPassiveAlgState) {
    color = edgeColors[state];
    width = edgeWidths[state];
  } else {
    color = edgeColors.default;
    width = edgeWidths.default;
  }

  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 1) return null;

  const nx = dx / dist;
  const ny = dy / dist;

  const sx = sourceX + nx * NODE_RADIUS;
  const sy = sourceY + ny * NODE_RADIUS;
  const ex = targetX - nx * NODE_RADIUS;
  const ey = targetY - ny * NODE_RADIUS;

  const arrowLen = directed ? 8 : 0;
  const aex = ex - nx * arrowLen;
  const aey = ey - ny * arrowLen;

  const edgePath = `M ${sx} ${sy} L ${aex} ${aey}`;
  const labelX = (sx + ex) / 2;
  const labelY = (sy + ey) / 2;

  const arrowAngle = Math.PI / 7;
  const angle = Math.atan2(dy, dx);
  const ax1 = ex - 10 * Math.cos(angle - arrowAngle);
  const ay1 = ey - 10 * Math.sin(angle - arrowAngle);
  const ax2 = ex - 10 * Math.cos(angle + arrowAngle);
  const ay2 = ey - 10 * Math.sin(angle + arrowAngle);

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={28}
        style={{ cursor: "pointer" }}
        onClick={(ev) => {
          ev.stopPropagation();
          edgeData?.onEdgeClick?.(ev);
        }}
      />
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={width}
        style={{ transition: "stroke 0.15s ease, stroke-width 0.15s ease, opacity 0.15s ease", pointerEvents: "none", opacity }}
      />
      {directed && (
        <polygon
          points={`${ex},${ey} ${ax1},${ay1} ${ax2},${ay2}`}
          fill={color}
          style={{ transition: "fill 0.15s ease, opacity 0.15s ease", pointerEvents: "none", opacity }}
        />
      )}
      {edgeData?.weight != null && (
        <EdgeLabelRenderer>
          <div
            className={`absolute text-xs font-mono px-1.5 py-0.5 rounded border pointer-events-none transition-colors duration-150 ${
              hovered
                ? "bg-sky-900/90 text-sky-200 border-sky-700"
                : "bg-zinc-800/90 text-zinc-300 border-zinc-700"
            }`}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {edgeData.weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}

export const CustomEdge = memo(CustomEdgeComponent);

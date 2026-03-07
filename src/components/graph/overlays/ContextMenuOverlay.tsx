"use client";

import { Plus, Trash2, Play as PlayIcon, Flag, Link, Hash, RotateCcw } from "lucide-react";
import type { ContextMenu } from "@/hooks/useGraphGestures";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

function MenuItem({ icon, label, onClick, danger }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors ${
        danger ? "text-red-400 hover:bg-red-950/40" : "text-zinc-300 hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

interface ContextMenuOverlayProps {
  ctxMenu: ContextMenu;
  onAddNode: () => void;
  onDeleteNode: () => void;
  onSetStart: () => void;
  onSetEnd: () => void;
  onStartEdgeCreation: () => void;
  onOpenWeightEditor: () => void;
  onDeleteEdge: () => void;
  onResetPlayback: () => void;
}

export function ContextMenuOverlay({
  ctxMenu,
  onAddNode,
  onDeleteNode,
  onSetStart,
  onSetEnd,
  onStartEdgeCreation,
  onOpenWeightEditor,
  onDeleteEdge,
  onResetPlayback,
}: ContextMenuOverlayProps) {
  if (!ctxMenu) return null;

  return (
    <div
      className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: ctxMenu.screenX, top: ctxMenu.screenY }}
      onClick={(ev) => ev.stopPropagation()}
    >
      {ctxMenu.type === "playback-locked" && (
        <>
          <div className="px-3 py-2 text-[11px] text-zinc-400 leading-snug border-b border-zinc-800">
            Graph editing is disabled while the algorithm is running. Reset playback to edit the graph.
          </div>
          <MenuItem icon={<RotateCcw className="w-3.5 h-3.5" />} label="Reset playback" onClick={onResetPlayback} />
        </>
      )}
      {ctxMenu.type === "pane" && (
        <MenuItem icon={<Plus className="w-3.5 h-3.5" />} label="Add Node" onClick={onAddNode} />
      )}
      {ctxMenu.type === "node" && (
        <>
          <MenuItem icon={<Link className="w-3.5 h-3.5" />} label="Add Edge from here..." onClick={onStartEdgeCreation} />
          <MenuItem icon={<PlayIcon className="w-3.5 h-3.5" />} label="Set as Start" onClick={onSetStart} />
          <MenuItem icon={<Flag className="w-3.5 h-3.5" />} label="Set as End" onClick={onSetEnd} />
          <div className="my-1 border-t border-zinc-800" />
          <MenuItem icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete Node" onClick={onDeleteNode} danger />
        </>
      )}
      {ctxMenu.type === "edge" && (
        <>
          <MenuItem icon={<Hash className="w-3.5 h-3.5" />} label="Change weight" onClick={onOpenWeightEditor} />
          <MenuItem icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete Edge" onClick={onDeleteEdge} danger />
        </>
      )}
    </div>
  );
}

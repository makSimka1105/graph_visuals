"use client";

interface EdgeWeightEditorOverlayProps {
  editingEdge: { edgeId: string; weight: number; weightInput: string; x: number; y: number };
  onWeightInputChange: (value: string) => void;
  onApply: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export function EdgeWeightEditorOverlay({
  editingEdge,
  onWeightInputChange,
  onApply,
  onKeyDown,
}: EdgeWeightEditorOverlayProps) {
  return (
    <div
      className="absolute z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl shadow-black/40 p-3 flex flex-col gap-2 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: editingEdge.x, top: editingEdge.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-xs text-zinc-400">Edge weight</span>
      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={editingEdge.weightInput}
          onChange={(e) => onWeightInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          autoFocus
        />
        <button
          onClick={onApply}
          className="px-2 py-1 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  );
}

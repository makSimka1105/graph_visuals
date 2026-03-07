"use client";

interface CanvasHintsOverlayProps {
  isTouchDevice: boolean;
  isPlayback: boolean;
  edgeSourceId: string | null;
}

export function CanvasHintsOverlay({ isTouchDevice, isPlayback, edgeSourceId }: CanvasHintsOverlayProps) {
  if (isPlayback || edgeSourceId) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] text-zinc-600 pointer-events-none select-none max-w-[95vw] px-2">
      {isTouchDevice ? (
        <>
          <span>Double-tap empty space to add node</span>
          <span>|</span>
          <span>Double-tap edge for menu</span>
          <span>|</span>
          <span>Tap node to select</span>
          <span>|</span>
          <span>Double-tap node for menu</span>
          <span>|</span>
          <span>Select + Delete to remove</span>
        </>
      ) : (
        <>
          <span>Double-click empty space to add node</span>
          <span>|</span>
          <span>Right-click empty space for menu</span>
          <span>|</span>
          <span>Shift+click node to create edge from selected</span>
          <span>|</span>
          <span>Click edge for menu</span>
          <span>|</span>
          <span>Right-click node for menu</span>
          <span>|</span>
          <span>Select + Delete to remove</span>
        </>
      )}
    </div>
  );
}

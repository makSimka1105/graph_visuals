"use client";

import { Link } from "lucide-react";

interface EdgeCreationBannerProps {
  edgeSourceId: string;
  isTouchDevice: boolean;
  onCancel: () => void;
}

export function EdgeCreationBanner({ edgeSourceId, isTouchDevice, onCancel }: EdgeCreationBannerProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-sky-900/80 text-sky-200 text-xs px-4 py-2 rounded-lg border border-sky-700 flex items-center gap-2 z-50">
      <Link className="w-3.5 h-3.5" />
      {isTouchDevice ? "Tap" : "Click"} a target node to connect from <span className="font-bold">{edgeSourceId}</span>
      <button onClick={onCancel} className="ml-2 text-sky-400 hover:text-sky-200 underline">
        Cancel
      </button>
    </div>
  );
}

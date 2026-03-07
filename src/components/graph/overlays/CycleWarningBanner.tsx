"use client";

interface CycleWarningBannerProps {
  show: boolean;
}

export function CycleWarningBanner({ show }: CycleWarningBannerProps) {
  if (!show) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-900/80 text-yellow-200 text-xs px-4 py-2 rounded-lg border border-yellow-700 z-50 animate-in fade-in duration-200">
      Edge added, but it created a cycle in an acyclic graph
    </div>
  );
}

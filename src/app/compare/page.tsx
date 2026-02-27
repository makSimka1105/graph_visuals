"use client";

import "@/algorithms";
import { ComparisonView } from "@/components/comparison/ComparisonView";

export default function ComparePage() {
  return (
    <div className="flex flex-col md:flex-row w-screen h-[100dvh] min-h-screen overflow-hidden bg-zinc-950">
      <ComparisonView />
    </div>
  );
}

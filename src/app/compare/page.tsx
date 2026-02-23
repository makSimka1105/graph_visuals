"use client";

import "@/algorithms";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 flex flex-col">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800 shrink-0">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-zinc-200">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-lg font-semibold text-zinc-100">Algorithm Comparison</h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <ComparisonView />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppSelector } from "@/store/hooks";
import { MetricsChart } from "./MetricsChart";

export function ComparisonResultsDrawer() {
  const [open, setOpen] = useState(false);
  const metrics = useAppSelector((s) => s.comparison.metrics);
  const comp = useAppSelector((s) => s.comparison);

  const hasResults = metrics.length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 bg-zinc-900 border-zinc-700 hover:bg-zinc-800"
          disabled={!hasResults}
        >
          <BarChart3 className="w-4 h-4" />
          Results
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[70vh] max-h-[600px] border-t border-zinc-800 bg-zinc-950"
      >
        <SheetHeader>
          <SheetTitle className="text-zinc-100">Comparison Results</SheetTitle>
        </SheetHeader>
        {hasResults ? (
          <div className="mt-4 px-4 pb-6 h-[calc(100%-4rem)] overflow-auto min-w-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-w-0">
              <div className="space-y-3 min-w-0 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                <h4 className="text-sm font-medium text-zinc-400">Algorithm Comparison</h4>
                <Table className="w-full">
                  <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Metric</TableHead>
                        <TableHead className="text-right text-zinc-400">
                          {metrics[0]?.algorithmName ?? "A"}
                        </TableHead>
                        <TableHead className="text-right text-zinc-400">
                          {metrics[1]?.algorithmName ?? "B"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-zinc-800">
                        <TableCell className="text-zinc-300">Steps</TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[0]?.stepsCount ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[1]?.stepsCount ?? "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-zinc-800">
                        <TableCell className="text-zinc-300">Visited Nodes</TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[0]?.visitedNodes ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[1]?.visitedNodes ?? "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-zinc-800">
                        <TableCell className="text-zinc-300">Path Length</TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[0]?.pathLength != null ? metrics[0].pathLength : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[1]?.pathLength != null ? metrics[1].pathLength : "—"}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-zinc-800">
                        <TableCell className="text-zinc-300">Time (ms)</TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[0]?.executionTimeMs != null ? metrics[0].executionTimeMs.toFixed(2) : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {metrics[1]?.executionTimeMs != null ? metrics[1].executionTimeMs.toFixed(2) : "—"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              <div className="space-y-3 min-w-0 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
                <h4 className="text-sm font-medium text-zinc-400">Graph Data</h4>
                <Table className="w-full">
                  <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-400">Metric</TableHead>
                        <TableHead className="text-right text-zinc-400">A</TableHead>
                        <TableHead className="text-right text-zinc-400">B</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-zinc-800">
                      <TableCell className="text-zinc-300">Nodes</TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {comp.graphA.nodes.length}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-zinc-400">
                          {comp.graphB.nodes.length}
                        </TableCell>
                    </TableRow>
                    <TableRow className="border-zinc-800">
                      <TableCell className="text-zinc-300">Edges</TableCell>
                      <TableCell className="text-right tabular-nums text-zinc-400">
                        {comp.graphA.edges.length}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-zinc-400">
                        {comp.graphB.edges.length}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-zinc-400">Charts</h4>
              <div className="h-[220px] min-h-[220px] rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <MetricsChart metrics={metrics} />
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            Run a comparison to see results here.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

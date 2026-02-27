"use client";

import { Rocket, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { comparisonSetSpeed } from "@/store/slices/comparisonSlice";
import { useComparisonRun } from "@/hooks/useComparisonRun";
import { ComparisonPlaybackButtons } from "./ComparisonPlaybackButtons";
import { ComparisonStepDescriptionSidebar } from "./ComparisonStepDescriptionSidebar";

export function ComparisonPlaybackControls() {
  const dispatch = useAppDispatch();
  const { canRun, handleRun, validation } = useComparisonRun();
  const comp = useAppSelector((s) => s.comparison);
  const hasSteps = comp.stepsA.length > 0 || comp.stepsB.length > 0;

  const sliderValue = Math.round(((1550 - comp.speed) / 1500) * 100);
  const handleSpeedSlider = (vals: number[]) => {
    const ms = Math.round(1550 - (vals[0] / 100) * 1500);
    dispatch(comparisonSetSpeed(Math.max(50, Math.min(1500, ms))));
  };
  const speedLabel =
    comp.speed <= 100
      ? "Very Fast"
      : comp.speed <= 300
        ? "Fast"
        : comp.speed <= 600
          ? "Normal"
          : comp.speed <= 1000
            ? "Slow"
            : "Very Slow";

  return (
    <div className="space-y-4 min-w-0 w-full overflow-hidden">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Playback</h3>

      {!hasSteps && (
        <>
          <Button onClick={handleRun} disabled={!canRun} className="w-full" variant="default">
            <Rocket className="w-4 h-4 mr-2" />
            Compare
          </Button>
          {!canRun && validation.length > 0 && (
            <div className="space-y-1">
              {validation.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-500">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-zinc-600" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {hasSteps && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-center">
            <ComparisonPlaybackButtons
              variant="outline"
              playButtonVariant="default"
              orientation="horizontal"
              showStepCounter={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ComparisonStepDescriptionSidebar source="A" />
            <ComparisonStepDescriptionSidebar source="B" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-zinc-400 text-xs">Speed</Label>
          <span className="text-xs text-zinc-500">{speedLabel}</span>
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[sliderValue]}
          onValueChange={handleSpeedSlider}
          className="[&_[role=slider]]:bg-zinc-300"
        />
      </div>
    </div>
  );
}

"use client";

import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  comparisonPlay,
  comparisonPause,
  comparisonStepForward,
  comparisonStepBackward,
  comparisonClearResults,
} from "@/store/slices/comparisonSlice";

export interface ComparisonPlaybackButtonsProps {
  variant?: "ghost" | "outline";
  size?: "icon";
  orientation?: "horizontal" | "vertical";
  showStepCounter?: boolean;
  playButtonVariant?: "ghost" | "outline" | "default";
  className?: string;
}

export function ComparisonPlaybackButtons({
  variant = "outline",
  size = "icon",
  orientation = "horizontal",
  showStepCounter = true,
  playButtonVariant,
  className = "",
}: ComparisonPlaybackButtonsProps) {
  const dispatch = useAppDispatch();
  const { stepsA, stepsB, currentStepIndex, playbackState } = useAppSelector((s) => s.comparison);

  const maxSteps = Math.max(stepsA.length, stepsB.length);

  const handlePlayPause = () => {
    if (playbackState === "playing") dispatch(comparisonPause());
    else dispatch(comparisonPlay());
  };

  const btnVariant = variant;
  const playVariant = playButtonVariant ?? variant;

  const btnClass =
    btnVariant === "ghost"
      ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30"
      : "";

  const playBtnClass =
    playVariant === "ghost"
      ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30"
      : "";

  const containerClass =
    orientation === "vertical"
      ? "flex flex-col items-center gap-2"
      : "flex items-center justify-center gap-2";

  return (
    <div className={`${containerClass} ${className}`}>
      <Button
        variant={btnVariant}
        size={size}
        onClick={() => dispatch(comparisonStepBackward())}
        disabled={currentStepIndex <= -1}
        className={btnClass}
      >
        <SkipBack className="w-4 h-4" />
      </Button>
      <Button
        variant={playVariant}
        size={size}
        onClick={handlePlayPause}
        disabled={playbackState === "finished" || maxSteps === 0}
        className={`${playVariant === "default" ? "w-10 h-10" : ""} ${playBtnClass}`}
      >
        {playbackState === "playing" ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </Button>
      <Button
        variant={btnVariant}
        size={size}
        onClick={() => dispatch(comparisonStepForward())}
        disabled={currentStepIndex >= maxSteps - 1}
        className={btnClass}
      >
        <SkipForward className="w-4 h-4" />
      </Button>
      <Button
        variant={btnVariant}
        size={size}
        onClick={() => dispatch(comparisonClearResults())}
        className={btnClass}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      {showStepCounter && (
        <span className="text-[10px] text-zinc-500 tabular-nums">
          {currentStepIndex + 1}/{maxSteps}
        </span>
      )}
    </div>
  );
}

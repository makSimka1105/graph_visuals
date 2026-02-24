"use client";

import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  play,
  pause,
  stepForward,
  stepBackward,
  resetPlayback,
} from "@/store/slices/algorithmSlice";

export interface PlaybackButtonsProps {
  variant?: "ghost" | "outline";
  size?: "icon";
  orientation?: "horizontal" | "vertical";
  showStepCounter?: boolean;
  playButtonVariant?: "ghost" | "outline" | "default";
  className?: string;
}

export function PlaybackButtons({
  variant = "outline",
  size = "icon",
  orientation = "horizontal",
  showStepCounter = true,
  playButtonVariant,
  className = "",
}: PlaybackButtonsProps) {
  const dispatch = useAppDispatch();
  const { steps, currentStepIndex, playbackState } = useAppSelector((s) => s.algorithm);

  const handlePlayPause = () => {
    if (playbackState === "playing") dispatch(pause());
    else dispatch(play());
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
        onClick={() => dispatch(stepBackward())}
        disabled={currentStepIndex <= -1}
        className={btnClass}
      >
        <SkipBack className="w-4 h-4" />
      </Button>
      <Button
        variant={playVariant}
        size={size}
        onClick={handlePlayPause}
        disabled={playbackState === "finished"}
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
        onClick={() => dispatch(stepForward())}
        disabled={currentStepIndex >= steps.length - 1}
        className={btnClass}
      >
        <SkipForward className="w-4 h-4" />
      </Button>
      <Button
        variant={btnVariant}
        size={size}
        onClick={() => dispatch(resetPlayback())}
        className={btnClass}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
      {showStepCounter && (
        <span className="text-[10px] text-zinc-500 tabular-nums">
          {currentStepIndex + 1}/{steps.length}
        </span>
      )}
    </div>
  );
}

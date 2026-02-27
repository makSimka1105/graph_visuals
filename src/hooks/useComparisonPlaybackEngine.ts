import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { comparisonStepForward } from "@/store/slices/comparisonSlice";

export function useComparisonPlaybackEngine() {
  const dispatch = useAppDispatch();
  const { playbackState, speed } = useAppSelector((s) => s.comparison);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playbackState === "playing") {
      intervalRef.current = setInterval(() => {
        dispatch(comparisonStepForward());
      }, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playbackState, speed, dispatch]);
}

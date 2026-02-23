import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { stepForward } from "@/store/slices/algorithmSlice";

export function usePlaybackEngine() {
  const dispatch = useAppDispatch();
  const { playbackState, speed } = useAppSelector((s) => s.algorithm);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playbackState === "playing") {
      intervalRef.current = setInterval(() => {
        dispatch(stepForward());
      }, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {clearInterval(intervalRef.current);}
    };
  }, [playbackState, speed, dispatch]);
}

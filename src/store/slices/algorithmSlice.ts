import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AlgorithmStep } from "@/types/graph";

type PlaybackState = "idle" | "playing" | "paused" | "finished";

interface AlgorithmState {
  selectedAlgorithmId: string | null;
  steps: AlgorithmStep[];
  currentStepIndex: number;
  playbackState: PlaybackState;
  speed: number;
}

const initialState: AlgorithmState = {
  selectedAlgorithmId: null,
  steps: [],
  currentStepIndex: -1,
  playbackState: "idle",
  speed: 500,
};

const algorithmSlice = createSlice({
  name: "algorithm",
  initialState,
  reducers: {
    selectAlgorithm(state, action: PayloadAction<string | null>) {
      state.selectedAlgorithmId = action.payload;
      state.steps = [];
      state.currentStepIndex = -1;
      state.playbackState = "idle";
    },
    setSteps(state, action: PayloadAction<AlgorithmStep[]>) {
      state.steps = action.payload;
      state.currentStepIndex = -1;
      state.playbackState = "paused";
    },
    stepForward(state) {
      if (state.currentStepIndex < state.steps.length - 1) {
        state.currentStepIndex += 1;
      }
      if (state.currentStepIndex >= state.steps.length - 1) {
        state.playbackState = "finished";
      }
    },
    stepBackward(state) {
      if (state.currentStepIndex > -1) {
        state.currentStepIndex -= 1;
      }
      if (state.playbackState === "finished") {
        state.playbackState = "paused";
      }
    },
    goToStep(state, action: PayloadAction<number>) {
      const idx = action.payload;
      if (idx >= -1 && idx < state.steps.length) {
        state.currentStepIndex = idx;
        state.playbackState = idx >= state.steps.length - 1 ? "finished" : "paused";
      }
    },
    play(state) {
      if (state.steps.length > 0 && state.currentStepIndex < state.steps.length - 1) {
        state.playbackState = "playing";
      }
    },
    pause(state) {
      if (state.playbackState === "playing") {
        state.playbackState = "paused";
      }
    },
    setSpeed(state, action: PayloadAction<number>) {
      state.speed = action.payload;
    },
    resetPlayback(state) {
      state.steps = [];
      state.currentStepIndex = -1;
      state.playbackState = "idle";
    },
  },
});

export const {
  selectAlgorithm,
  setSteps,
  stepForward,
  stepBackward,
  goToStep,
  play,
  pause,
  setSpeed,
  resetPlayback,
} = algorithmSlice.actions;

export default algorithmSlice.reducer;

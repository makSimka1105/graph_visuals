import { configureStore } from "@reduxjs/toolkit";
import graphReducer from "./slices/graphSlice";
import algorithmReducer from "./slices/algorithmSlice";
import comparisonReducer from "./slices/comparisonSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      graph: graphReducer,
      algorithm: algorithmReducer,
      comparison: comparisonReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

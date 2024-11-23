import { configureStore } from "@reduxjs/toolkit";
import { socketReducer } from "../slice/socketSlice";

export const store = configureStore({
  reducer: {
    socketData: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

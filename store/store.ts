import { configureStore } from "@reduxjs/toolkit";
import freshRegistrationReducer from "./slices/freshRegistrationSlice";
import otherApplicationReducer from "./slices/otherApplicationSlice";

export const store = configureStore({
  reducer: {
    freshRegistration: freshRegistrationReducer,
    otherApplication: otherApplicationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["freshRegistration.registration"],
        ignoredActionPaths: ["payload.patch.fileObject", "payload.fileObject"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

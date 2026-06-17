import { configureStore, combineReducers, Action } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import adminReducer from "./admin/adminSlice";
import comparisonReducer from "./comparison/comparisonSlice"; 
import settingsReducer from "./settings/settingsSlice"; 
import selectionReducer from "./library/selectionSlice";
import libraryUIReducer from "./library/libraryUISlice";
import themeReducer from "./ui/themeSlice";
import notificationReducer from "./ui/notificationSlice";
import appReducerSlice from "./ui/appSlice";
import libraryReducer from "./library/librarySlice";
import workspaceReducer from "./workspace/workspaceSlice";
import prettifyReducer from "./workspace/prettifySlice";

const appReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  comparison: comparisonReducer,
  settings: settingsReducer,
  selection: selectionReducer,
  libraryUI: libraryUIReducer,
  theme: themeReducer,
  notifications: notificationReducer,
  app: appReducerSlice,
  library: libraryReducer,
  workspace: workspaceReducer,
  prettify: prettifyReducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: Action) => {
  if (action.type === 'auth/logout/fulfilled' || action.type === 'auth/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

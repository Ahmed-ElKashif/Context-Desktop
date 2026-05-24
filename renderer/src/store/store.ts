import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import documentReducer from "./documentSlice";
import adminReducer from "./adminSlice";
import comparisonReducer from "./comparisonSlice"; 
import settingsReducer from './settingsSlice'; 
import selectionReducer from './selectionSlice';
import libraryUIReducer from './libraryUISlice';
import themeReducer from './themeSlice';
import notificationReducer from './notificationSlice';

const appReducer = combineReducers({
  auth: authReducer,
  document: documentReducer,
  admin: adminReducer,
  comparison: comparisonReducer,
  settings: settingsReducer,
  selection: selectionReducer,
  libraryUI: libraryUIReducer,
  theme: themeReducer,
  notifications: notificationReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logout/fulfilled') {
    // Reset all state to undefined when the user logs out.
    // Reducers will return their initial state.
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

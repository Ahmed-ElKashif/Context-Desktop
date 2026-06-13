import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isServerDown: boolean;
}

const initialState: AppState = {
  isServerDown: false,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setServerDown: (state, action: PayloadAction<boolean>) => {
      state.isServerDown = action.payload;
    },
  },
});

export const { setServerDown } = appSlice.actions;
export default appSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    loading: false,
    // AI auto-fill data pushed from the Meeting modal AI panel
    aiFilled: false,
    afuData: null,   // { nextAction, followUpDate, immediateFU, nextSteps }
    csRows: [],      // [{ dept, notes, email, contact }]
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAiFilled: (state, action) => {
      state.aiFilled = true;
      state.afuData = action.payload.afuData;
      state.csRows = action.payload.csRows;
    },
    clearAiFilled: (state) => {
      state.aiFilled = false;
      state.afuData = null;
      state.csRows = [];
    },
  },
});

export const { setLoading, setAiFilled, clearAiFilled } = uiSlice.actions;
export default uiSlice.reducer;
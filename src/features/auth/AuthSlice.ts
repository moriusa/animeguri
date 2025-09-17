import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    id: null,
    email: null,
    name: "名無し",
  },
  isLogin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state) => {
      // state.user = action.payload;
      state.isLogin = true;
    },
  },
});

export const { login } = authSlice.actions;
export default authSlice.reducer;

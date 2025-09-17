import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  email: string
  userId: string
  accessToken: string
  idToken: string
}

interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserInfo>) => {
      state.isAuthenticated = true;
      state.user = action.payload
    },
  },
});

export const { login } = authSlice.actions;
export default authSlice.reducer;

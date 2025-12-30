import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserInfo {
  email: string;
  userId: string;
  accessToken: string;
  idToken: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  userProfile: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  userProfile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.userProfile = action.payload;
    },
    login: (state, action: PayloadAction<UserInfo>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    updateUserEmail: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.email = action.payload;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.userProfile = null;
    },
  },
});

export const { setUserProfile, login, logout, updateUserEmail } =
  authSlice.actions;
export default authSlice.reducer;

"use client";

import { createContext, useContext, ReactNode } from "react";
import { User } from "@/types/api/user";
import { useGetUserProfile } from "@/features/user/hooks/useGetUserProfile";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn, isLoading } = useGetUserProfile();

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 呼び出し用のカスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
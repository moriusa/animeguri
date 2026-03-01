"use client";

import { Provider } from "react-redux";
import { store } from "../store";
import { useAuthInit } from "@/features/auth/useAuthInit";
import { ConfirmDialogProvider } from "@/components/common/ConfirmDialog";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  useAuthInit(); // アプリ起動時に認証状態をチェック
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </AuthInitializer>
    </Provider>
  );
}

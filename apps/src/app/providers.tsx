"use client";

import { useAuthInit } from "@/features/auth/useAuthInit";
import { ConfirmDialogProvider } from "@/components/common/ConfirmDialog";
import { SWRConfig } from "swr";
import "@/lib/amplifyConfig";

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  useAuthInit(); // アプリ起動時に認証状態をチェック
  return <>{children}</>;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false, // タブ復帰時に再取得
        revalidateOnReconnect: true, // ネットワーク復帰時に再取得
        dedupingInterval: 30 * 1000, // 30秒
        errorRetryCount: 2, // リトライ2回
        errorRetryInterval: 3000, // リトライ間隔3秒
        shouldRetryOnError: (err) => {
          // 401/403はリトライしない
          if (err?.status === 401 || err?.status === 403) return false;
          return true;
        },
      }}
    >
      <AuthInitializer>
        <ConfirmDialogProvider>{children}</ConfirmDialogProvider>
      </AuthInitializer>
    </SWRConfig>
  );
}

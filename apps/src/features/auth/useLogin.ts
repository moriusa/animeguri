import { signIn } from "@/lib";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginFormValues } from "@/app/login/page";
import { useGetUserProfile } from "../user/hooks/useGetUserProfile";
import { useConfirm } from "@/components/common/ConfirmDialog";

export const useLogin = () => {
  const router = useRouter();
  const { refreshUser } = useGetUserProfile();
  const confirm = useConfirm();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (v: LoginFormValues) => {
    setIsLoading(true);
    try {
      await signIn(v.email, v.password);
      refreshUser();
      router.push("/");
    } catch (err) {
      const errorString = String(err);
      if (errorString.includes("NotAuthorizedException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description: "メールアドレスまたはパスワードが正しくありません。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (errorString.includes("UserAlreadyAuthenticatedException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description:
            "すでにログイン状態です。一度ログアウトしてから再度お試しください。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (errorString.includes("Network")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description: "通信エラーが発生しました。電波状況を確認してください。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (
        errorString.includes("UserNotConfirmedException") ||
        errorString.includes("UserLambdaValidationException")
      ) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description:
            "このアカウントは現在ご利用いただけません。運営にお問い合わせください。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (errorString.includes("UserNotFoundException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description: "メールアドレスまたはパスワードが正しくありません。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (errorString.includes("PasswordResetRequiredException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description:
            "安全のためアカウントがロックされました。パスワードを再設定するか、時間をおいてお試しください。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description: errorString,
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading };
};

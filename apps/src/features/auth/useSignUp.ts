"use client";
import { SignUpFormValues } from "@/app/signUp/page";
import { confirmSignUp, resendConfirmationCode, signIn, signUp } from "@/lib";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateUserProfile } from "../user/hooks/useCreateUserProfile";
import { useGetUserProfile } from "../user/hooks/useGetUserProfile";
import { useConfirm } from "@/components/common/ConfirmDialog";

export const useSignUp = () => {
  const confirm = useConfirm();
  const { createProfile } = useCreateUserProfile();
  const { refreshUser } = useGetUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  // emailだけ確認コードのために別で状態管理しとく
  const [email, setEmail] = useState("");
  const router = useRouter();

  // cognitoでサインアップ
  const handleSignUp = async (v: SignUpFormValues) => {
    if (isLoading) return; // ★ 二重クリック対策
    setIsLoading(true);
    try {
      setEmail(v.email);
      await signUp({
        email: v.email,
        password: v.password,
      });
      setStep("confirm");
      alert("確認コードをメールに送信しました");
    } catch (err: any) {
      const errorString = String(err);
      if (errorString.includes("UsernameExistsException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description:
            "このメールアドレスは既に登録されています。ログイン画面からサインインしてください。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (errorString.includes("InvalidPasswordException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description:
            "パスワードは8文字以上、かつ大文字・小文字・数字を含める必要があります。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      } else if (errorString.includes("InvalidParameterException")) {
        await confirm({
          type: "alert",
          title: "エラーが発生しました。",
          description: "正しいメールアドレスの形式で入力してください。",
          confirmText: "閉じる",
          confirmVariant: "default",
        });
      }
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 確認コード認証
  const handleConfirmSignUp = async (v: SignUpFormValues) => {
    setIsLoading(true);

    try {
      if (!v.confirmationCode) {
        throw new Error("確認コードが入力されていません");
      }
      // 1. サインアップ検証
      await confirmSignUp(v.email, v.confirmationCode);
      // 2. ログインしてidToken取得(cognito)
      await signIn(v.email, v.password);
      // 3. idTokenを使用してAPI叩く
      await createProfile();
      alert("アカウントが正常に作成されました");
      refreshUser();
      router.push("/");
    } catch (err: any) {
      await confirm({
        type: "alert",
        title: err.message,
        description: "確認コードの検証に失敗しました",
        confirmText: "閉じる",
        confirmVariant: "default",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 確認コード再送信
  const handleResendCode = async () => {
    try {
      await resendConfirmationCode(email);
      alert("確認コードを再送信しました");
    } catch (err: any) {
      await confirm({
        type: "alert",
        title: err.message,
        description: "再送信に失敗しました",
        confirmText: "閉じる",
        confirmVariant: "default",
      });
    }
  };

  return {
    isLoading,
    step,
    handleSignUp,
    handleConfirmSignUp,
    handleResendCode,
  };
};

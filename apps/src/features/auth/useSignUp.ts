import { SignUpFormValues } from "@/app/signUp/page";
import { confirmSignUp, resendConfirmationCode, signIn, signUp } from "@/lib";
import { createUserProfile } from "@/lib/userProfile";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserInfo } from "./AuthSlice";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  // emailだけ確認コードのために別で状態管理しとく
  const [email, setEmail] = useState("");
  const router = useRouter();

  // cognitoでサインアップ
  const handleSignUp = async (v: SignUpFormValues) => {
    if (isLoading) return; // ★ 二重クリック対策
    setIsLoading(true);
    setError("");
    try {
      setEmail(v.email);
      await signUp({
        email: v.email,
        password: v.password,
      });
      setStep("confirm");
      alert("確認コードをメールに送信しました");
    } catch (err: any) {
      setError(err.message || "サインアップに失敗しました");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 確認コード認証
  const handleConfirmSignUp = async (v: SignUpFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      if (!v.confirmationCode) {
        throw new Error("確認コードが入力されていません");
      }
      // 1. サインアップ検証
      await confirmSignUp(v.email, v.confirmationCode);
      // 2. ログインしてidToken取得(cognito)
      const cognitoUser: UserInfo = await signIn(v.email, v.password);
      // 3. idTokenを使用してAPI叩く
      await createUserProfile(cognitoUser.idToken);
      alert("アカウントが正常に作成されました");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "確認コードの検証に失敗しました");
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
      setError(err.message || "再送信に失敗しました");
    }
  };

  return {
    isLoading,
    error,
    step,
    handleSignUp,
    handleConfirmSignUp,
    handleResendCode,
  };
};

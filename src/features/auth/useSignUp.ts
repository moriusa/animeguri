import { SignUpFormValues } from "@/app/signUp/page";
import { confirmSignUp, resendConfirmationCode, signUp } from "@/lib";
import { createUserProfile } from "@/lib/userProfile";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  // emailだけ確認コードのために別で状態管理しとく
  const [email, setEmail] = useState("");
  // DB保存のためにid取得
  const [cognitoUserId, setCognitoUserId] = useState('');
  const router = useRouter();

  // cognitoでサインアップ
  const handleSignUp = async (v: SignUpFormValues) => {
    setIsLoading(true);
    setError("");
    try {
      setEmail(v.email);
      const result = await signUp({
        email: v.email,
        password: v.password,
      });
      setStep("confirm");
      // signUpのレスポンスにuserIdが含まれている
      setCognitoUserId(result.userSub);
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
      await createUserProfile(v, cognitoUserId);
      await confirmSignUp(v.email, v.confirmationCode);
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

"use client";

import { signUp, confirmSignUp, resendConfirmationCode } from "@/lib";
import { useState } from "react";

interface SignUpFormValues {
  email: string;
  password: string;
}

const Page = () => {
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmationCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      setStep("confirm");
      alert("確認コードをメールに送信しました");
    } catch (err: any) {
      setError(err.message || "サインアップに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await confirmSignUp(formData.email, formData.confirmationCode);
      alert("アカウントが正常に作成されました");
      // ログインページにリダイレクト
    } catch (err: any) {
      setError(err.message || "確認コードの検証に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendConfirmationCode(formData.email);
      alert("確認コードを再送信しました");
    } catch (err: any) {
      setError(err.message || "再送信に失敗しました");
    }
  };

  if (step === "confirm") {
    return (
      <form onSubmit={handleConfirmSignUp}>
        <h2>メール確認</h2>
        <p>メールに送信された確認コードを入力してください</p>

        <input
          type="text"
          placeholder="確認コード"
          value={formData.confirmationCode}
          onChange={(e) =>
            setFormData({ ...formData, confirmationCode: e.target.value })
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "確認中..." : "確認"}
        </button>

        <button type="button" onClick={handleResendCode}>
          確認コードを再送信
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp}>
      <h2>サインアップ</h2>

      <input
        type="email"
        placeholder="メールアドレス"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="パスワード"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <input
        type="text"
        placeholder="名前（オプション）"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <button type="submit" disabled={loading}>
        {loading ? "サインアップ中..." : "サインアップ"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default Page;

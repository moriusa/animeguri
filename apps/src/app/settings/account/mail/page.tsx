"use client";

import { Input } from "@/components/common";
import { getCurrentUserEmail, updateEmail, verifyEmailChange } from "@/lib";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface EmailFormValues {
  newEmail: string;
}

interface VerificationFormValues {
  verificationCode: string;
}

const Page = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
    useEffect(() => {
      getCurrentUserEmail().then(setUserEmail);
    }, []);

  // ステップ管理
  const [step, setStep] = useState<"input" | "verify">("input");
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ステップ1: メールアドレス入力フォーム
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormValues>();

  // ステップ2: 確認コード入力フォーム
  const {
    register: registerVerification,
    handleSubmit: handleSubmitVerification,
    formState: { errors: verificationErrors },
  } = useForm<VerificationFormValues>();

  // ステップ1: メールアドレス送信
  const onSubmitEmail: SubmitHandler<EmailFormValues> = async (data) => {
    setIsLoading(true);
    try {
      await updateEmail(data.newEmail);
      setNewEmail(data.newEmail);
      setStep("verify");
      alert(`確認コードを ${data.newEmail} に送信しました`);
    } catch (error: any) {
      console.error("Email update error:", error);
      alert(error.message || "メールアドレスの変更に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // ステップ2: 確認コード送信
  const onSubmitVerification: SubmitHandler<VerificationFormValues> = async (
    data
  ) => {
    setIsLoading(true);
    try {
      await verifyEmailChange("email", data.verificationCode);
      alert("メールアドレスを変更しました");

      setUserEmail(newEmail);

      // リセット
      setStep("input");
      setNewEmail("");
    } catch (error: any) {
      console.error("Verification error:", error);
      alert(error.message || "確認コードが正しくありません");
    } finally {
      setIsLoading(false);
    }
  };

  // キャンセルボタン
  const handleCancel = () => {
    if (window.confirm("メールアドレスの変更をキャンセルしますか？")) {
      setStep("input");
      setNewEmail("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="font-bold text-2xl text-gray-900">
            メールアドレスを変更
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            新しいメールアドレスに確認コードが送信されます
          </p>
        </div>

        {/* 現在のメールアドレス表示 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">現在のメールアドレス</p>
          <p className="font-semibold text-gray-900 mt-1">
            {userEmail || "未設定"}
          </p>
        </div>

        {/* ステップ1: メールアドレス入力 */}
        {step === "input" && (
          <form
            onSubmit={handleSubmitEmail(onSubmitEmail)}
            className="space-y-6"
          >
            <Input
              id="newEmail"
              text="新しいメールアドレス"
              type="email"
              name="newEmail"
              register={registerEmail}
              validation={{
                required: "メールアドレスは必須です",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "正しいメールアドレスを入力してください",
                },
                validate: (value) =>
                  value !== userEmail || "現在のメールアドレスと同じです",
              }}
              error={emailErrors?.newEmail?.message}
              placeholder="example@email.com"
            />

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    送信中...
                  </>
                ) : (
                  "確認コードを送信"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ステップ2: 確認コード入力 */}
        {step === "verify" && (
          <form
            onSubmit={handleSubmitVerification(onSubmitVerification)}
            className="space-y-6"
          >
            {/* 送信先の表示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📧 <strong>{newEmail}</strong> に確認コードを送信しました
              </p>
              <p className="text-xs text-blue-600 mt-1">
                メールが届かない場合は、迷惑メールフォルダをご確認ください
              </p>
            </div>

            <Input
              id="verificationCode"
              text="確認コード"
              type="text"
              name="verificationCode"
              register={registerVerification}
              validation={{
                required: "確認コードは必須です",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "6桁の数字を入力してください",
                },
              }}
              error={verificationErrors?.verificationCode?.message}
              placeholder="123456"
              // autoComplete="off"
            />

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    確認中...
                  </>
                ) : (
                  "メールアドレスを変更"
                )}
              </button>
            </div>

            {/* 確認コード再送信 */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                確認コードが届きませんか？{" "}
                <button
                  type="button"
                  onClick={() => onSubmitEmail({ newEmail })}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  再送信
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Page;

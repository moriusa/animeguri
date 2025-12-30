// components/settings/ChangePasswordForm.tsx
"use client";
import { Input } from "@/components/common";
import { changePassword } from "@/lib";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface PasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Page = () => {
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<PasswordFormValues> = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("新しいパスワードが一致しません");
      return;
    }

    setLoading(true);

    try {
      // パスワードをtrimして空白を除去
      await changePassword(data.oldPassword.trim(), data.newPassword.trim());
      alert("パスワードを変更しました");
    } catch (error: any) {
      alert(error.message || "パスワードの変更に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({});

  // 共通のパスワードバリデーション（先頭・末尾の空白チェック追加）
  const passwordBaseValidation = {
    validate: {
      noLeadingTrailingSpace: (value: string) =>
        value === value.trim() ||
        "パスワードの先頭・末尾に空白を含めることはできません",
    },
  };

  // 新しいパスワードのバリデーションルール
  const newPasswordValidation = {
    required: "新しいパスワードを入力してください",
    minLength: {
      value: 8,
      message: "パスワードは8文字以上である必要があります",
    },
    validate: {
      noLeadingTrailingSpace: (value: string) =>
        value === value.trim() ||
        "パスワードの先頭・末尾に空白を含めることはできません",
      hasNumber: (value: string) =>
        /\d/.test(value) || "少なくとも1つの数字を含めてください",
      hasUpperCase: (value: string) =>
        /[A-Z]/.test(value) || "少なくとも1つの大文字を含めてください",
      hasLowerCase: (value: string) =>
        /[a-z]/.test(value) || "少なくとも1つの小文字を含めてください",
    },
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="oldPassword"
        text="現在のパスワード"
        name="oldPassword"
        register={register}
        type="password"
        mask={true}
        validation={{
          required: "現在のパスワードを入力してください",
          ...passwordBaseValidation,
        }}
        error={errors?.oldPassword?.message}
      />

      <Input
        id="newPassword"
        text="新しいパスワード"
        name="newPassword"
        register={register}
        type="password"
        mask={true}
        validation={newPasswordValidation}
        error={errors?.newPassword?.message}
      />

      <Input
        id="confirmPassword"
        text="新しいパスワード(確認)"
        name="confirmPassword"
        register={register}
        type="password"
        mask={true}
        validation={{
          required: "新しいパスワードを入力してください",
          ...passwordBaseValidation,
        }}
        error={errors?.confirmPassword?.message}
      />

      {/* パスワード要件の表示 */}
      <div className="text-sm text-gray-600 space-y-1">
        <p className="font-medium">パスワードの要件：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>8文字以上</li>
          <li>少なくとも1つの数字を含む</li>
          <li>少なくとも1つの大文字を含む</li>
          <li>少なくとも1つの小文字を含む</li>
          <li>先頭・末尾に空白を含まない</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "変更中..." : "パスワードを変更"}
      </button>
    </form>
  );
};

export default Page;

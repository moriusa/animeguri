"use client";

import { Button, Input } from "@/components/common";
import { GoogleButton } from "@/components/common/GoogleButton";
import { useSignUp } from "@/features";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

export interface SignUpFormValues {
  email: string;
  password: string;
  confirmationCode?: string;
}

const Page = () => {
  const {
    isLoading,
    step,
    handleSignUp,
    handleConfirmSignUp,
    handleResendCode,
  } = useSignUp();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({ mode: "onChange" });
  const onSubmit: SubmitHandler<SignUpFormValues> = (data) => {
    handleSignUp(data);
  };
  const onConfirmSubmit: SubmitHandler<SignUpFormValues> = (data) => {
    handleConfirmSignUp(data);
  };

  if (step === "confirm") {
    return (
      <div className="mx-auto max-w-[34rem]">
        <h2 className="font-bold text-2xl text-center">メール確認</h2>
        <form
          onSubmit={handleSubmit(onConfirmSubmit)}
          className="bg-white mt-8 py-2 border border-gray-300"
        >
          <div className="p-10">
            <p className="mb-4">
              メールに送信された確認コードを入力してください
            </p>

            <Input
              id="confirmationCode"
              text="確認コード"
              type="text"
              name="confirmationCode"
              register={register}
              validation={{
                required: "確認コードは必須です",
              }}
              error={errors.confirmationCode?.message}
            />

            <div className="mt-7">
              <Button
                text={isLoading ? "確認中..." : "確認"}
                disabled={isLoading}
                btnColor="blown"
              />
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-blue-600 hover:underline"
              >
                確認コードを再送信
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[34rem]">
      <h2 className="font-bold text-2xl text-center">会員登録</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white mt-8 py-2 border border-gray-300"
      >
        <div className="p-10">
          <Input
            id="email"
            text="メールアドレス"
            type="email"
            name="email"
            register={register}
            validation={{
              required: "メールアドレスは必須です",
            }}
            error={errors.email?.message}
          />

          <div className="mt-7 flex items-center">
            <Input
              id="password"
              text="パスワード"
              type="password"
              name="password"
              register={register}
              validation={{
                required: "パスワードは必須です",
                minLength: {
                  value: 8,
                  message: "8文字以上で入力してください",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "大文字、小文字、数字をそれぞれ1文字以上含めてください",
                },
              }}
              error={errors.password?.message}
              mask={true}
            />
          </div>
          <div className="mt-7">
            <Button
              text={isLoading ? "登録中..." : "登録"}
              disabled={isLoading}
              btnColor="blown"
            />
          </div>
        </div>
        <div className="border-t-1 border-gray-300 p-10">
          <GoogleButton type="signUp" />
          <div className="block text-center mt-8">
            <Link href="/login">
              <p className="border-b-1 inline hover:opacity-80 cursor-pointer">
                ログインはこちら
              </p>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;

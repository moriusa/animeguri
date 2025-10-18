import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, Input } from "./common";
import Link from "next/link";

interface FormValues {
  email: string;
  password: string;
}

interface ButtonProps {
  formType: "login" | "signUp";
}

export const AuthForm = ({ formType }: ButtonProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onBlur" });
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
  };

  const formOptions = {
    login: {
      title: "ログイン",
      linkText: "会員登録はこちら",
      linkHref: "/signUp",
    },
    signUp: {
      title: "新規登録",
      linkText: "ログインはこちら",
      linkHref: "/login",
    },
  };

  const { title, linkText, linkHref } = formOptions[formType];

  return (
    <div className="mx-auto max-w-[34rem]">
      <h2 className="font-bold text-2xl text-center">{title}</h2>
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
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "正しいメールアドレスを入力してください",
              },
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
                  value: 6,
                  message: "パスワードは6文字以上で入力してください",
                },
              }}
              error={errors.password?.message}
              mask={true}
            />
          </div>
          <div className="mt-7">
            <Button text={title} btnColor="blown" />
          </div>
        </div>
        <div className="border-t-1 border-gray-300 p-10">
          <div className="block mt-7 text-center">
            <Link href={linkHref}>
              <p className="border-b-1 inline hover:opacity-80 cursor-pointer">
                {linkText}
              </p>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

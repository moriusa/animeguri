"use client";

import { Button, Input } from "@/components/common";
import { useLogin } from "@/features";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

export interface LoginFormValues {
  email: string;
  password: string;
}

const Page = () => {
  const { handleLogin, isLoading } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: "onChange" });

  const onSubmit: SubmitHandler<LoginFormValues> = (data) => {
    console.log(data);
    handleLogin(data);
  };

  return (
    <div className="mx-auto max-w-[34rem]">
      <h2 className="font-bold text-2xl text-center">ログイン</h2>
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
              }}
              error={errors.password?.message}
              mask={true}
            />
          </div>
          <div className="mt-7">
            <Button
              text={isLoading ? "ログイン中..." : "ログイン"}
              disabled={isLoading}
              btnColor="blown"
            />
          </div>
        </div>
        <div className="border-t-1 border-gray-300 p-10">
          <div className="block text-center">
            <Link href="/signUp">
              <p className="border-b-1 inline hover:opacity-80 cursor-pointer">
                会員登録はこちら
              </p>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Page;

"use client";

import { signInWithGoogle } from "@/lib";
import Image from "next/image";
import { useState } from "react";

export const GoogleButton = ({ type }: { type: "login" | "signUp" }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const handleConnect = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      const errorString = String(error);
      console.log(error);
      if (errorString.includes("UserAlreadyAuthenticatedException")) {
        setErrorMsg(
          "すでにログイン状態です。一度ログアウトしてから再度お試しください。",
        );
      } else {
        setErrorMsg(
          "Googleログインの起動に失敗しました。時間をおいて再度お試しください。",
        );
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleConnect}
        disabled={false}
        className={`w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-4 px-4 font-bold cursor-pointer hover:border-gray-500`}
      >
        <Image src="/google_logo.svg" alt="Google" width={20} height={20} />
        {`Googleで${type === "login" ? "ログイン" : "登録"}`}
      </button>
      {errorMsg && <p>{errorMsg}</p>}
    </>
  );
};

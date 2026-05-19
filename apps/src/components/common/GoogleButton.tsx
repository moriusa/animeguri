"use client"; // App Routerの場合は必須

import { signInWithGoogle } from "@/lib";
import Image from "next/image";
import { useState } from "react";

export const GoogleButton = ({ type }: { type: "login" | "signUp" }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={false}
      className={`w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-4 px-4 font-bold ${
        isLoading
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-gray-500"
      }`}
    >
      <Image src="/google_logo.svg" alt="Google" width={20} height={20} />
      {isLoading
        ? "接続中..."
        : `Googleで${type === "login" ? "ログイン" : "登録"}`}
    </button>
  );
};

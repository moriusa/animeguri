import { signInWithGoogle } from "@/lib";
import Image from "next/image";

export const GoogleButton = ({ type }: { type: "login" | "signUp" }) => {
  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded py-4 px-4 font-bold cursor-pointer hover:border-gray-500"
    >
      <Image src="/google_logo.svg" alt="Google" width={20} height={20} />
      Googleで{type === "login" ? "ログイン" : "登録"}
    </button>
  );
};

"use client";

import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const Page = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  return (
    <div>
      <h2>アカウント設定</h2>
      <div
        className="bg-white p-3 cursor-pointer hover:bg-amber-100"
        onClick={() => router.push("/settings/account/mail")}
      >
        <h3>メールアドレス</h3>
        <p>{user?.email}</p>
      </div>
      <div
        className="bg-white p-3 cursor-pointer hover:bg-amber-100"
        onClick={() => router.push("/settings/account/password")}
      >
        <h3>パスワード</h3>
      </div>
    </div>
  );
};

export default Page;

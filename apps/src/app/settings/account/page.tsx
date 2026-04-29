"use client";

import { getCurrentUserEmail } from "@/lib";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUserEmail().then(setUserEmail);
  }, []);

  return (
    <div>
      <h2>アカウント設定</h2>
      <div
        className="bg-white p-3 cursor-pointer hover:bg-amber-100"
        onClick={() => router.push("/settings/account/mail")}
      >
        <h3>メールアドレス</h3>
        <p>{userEmail}</p>
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

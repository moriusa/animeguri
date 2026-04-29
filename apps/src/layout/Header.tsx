"use client";
import { FC } from "react";
import Link from "next/link";
import { Button, PostButton } from "@/components/common";
import { UserMenu } from "@/components/header/UserMenu";
import { SearchBox } from "@/components/header/SearchBox";
import { useGetUserProfile } from "@/features/user/hooks/useGetUserProfile";

export const Header: FC = () => {
  const { user, isLoggedIn } = useGetUserProfile();
  return (
    <nav className="text-black">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between p-3">
        <Link href={"/"} className="cursor-pointer text-2xl font-bold">
          animeguri
        </Link>
        <div className="flex items-center gap-8">
          <SearchBox />
          {isLoggedIn && user ? (
            <div className="flex items-center gap-4">
              <Link href={"/post"}>
                <PostButton />
              </Link>
              <UserMenu userProfile={user} />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href={"/signUp"}>
                <Button text="新規登録" btnColor="white" />
              </Link>
              <Link href={"/login"}>
                <Button text="ログイン" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

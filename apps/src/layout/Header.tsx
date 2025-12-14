"use client";
import { FC } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { Button } from "@/components/common";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { UserMenu } from "@/components/header/UserMenu";

export const Header: FC = () => {
  const { isAuthenticated, userProfile } = useSelector(
    (state: RootState) => state.auth
  );
  return (
    <nav className="text-secondary">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between p-3">
        <Link href={"/"} className="cursor-pointer text-2xl font-bold">
          animeguri
        </Link>
        <div className="flex items-center gap-8">
          <FaSearch size={20} className="cursor-pointer" />
          {isAuthenticated && userProfile ? (
            <div className="flex items-center gap-4">
              <Link href={"/post"}>
                <Button text="投稿" btnColor="white" />
              </Link>
              <UserMenu userProfile={userProfile}/>
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

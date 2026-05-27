"use client";
import { FC, useState } from "react";
import Link from "next/link";
import { Button, PostButton } from "@/components/common";
import { UserMenu } from "@/components/header/UserMenu";
import { SearchBox } from "@/components/header/SearchBox";
import { useGetUserProfile } from "@/features/user/hooks/useGetUserProfile";
import { FaSearch } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";

export const Header: FC = () => {
  const { user, isLoggedIn } = useGetUserProfile();
  const [isSearchBox, setIsSearchBox] = useState(false);
  return (
    <nav className="text-black">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between p-3">
        {!isSearchBox && (
          <Link
            href={"/"}
            className="cursor-pointer text-2xl md:text-3xl font-bold"
          >
            animeguri
          </Link>
        )}
        {isSearchBox ? (
          <div className="flex mx-auto">
            <SearchBox />
            <button
              onClick={() => setIsSearchBox(false)}
              className="cursor-pointer"
            >
              <IoIosClose size={40} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:block">
              <SearchBox />
            </div>
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsSearchBox(true)}>
                <FaSearch size={20} className="cursor-pointer" />
              </button>
            </div>
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
        )}
      </div>
    </nav>
  );
};

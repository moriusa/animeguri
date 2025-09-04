"use client";

import { FC } from "react";
import { Button } from "@/app/components";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { useAuth } from "react-oidc-context";

export const Header: FC = () => {
  const auth = useAuth();

  // デバッグ情報を追加
  console.log("Header - auth state:", {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
    error: auth.error
  });

  return (
    <nav className="text-secondary">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between p-3">
        <Link href={"/"} className="cursor-pointer text-2xl font-bold">
          Anipilgoo
        </Link>
        <div className="flex items-center gap-8">
          <FaSearch size={20} className="cursor-pointer" />
          {/* デバッグ情報を表示 */}
          <div className="text-xs text-gray-500">
            Auth: {auth.isAuthenticated ? "✓" : "✗"} | Loading: {auth.isLoading ? "✓" : "✗"}
          </div>
          {auth.isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* ユーザー画像 */}
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {auth.user?.profile.picture ? (
                  <img 
                    src={auth.user.profile.picture} 
                    alt="ユーザー画像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {auth.user?.profile.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              {/* ユーザー名 */}
              <span className="text-sm font-medium">
                {auth.user?.profile.name || auth.user?.profile.email || "ユーザー"}
              </span>
              {/* ログアウトボタン */}
              <Button 
                text="ログアウト" 
                btnColor="white" 
                onClick={() => auth.removeUser()}
              />
            </div>
          ) : (
            <Link href={"/login"}>
              <Button text="ログイン" btnColor="blown" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
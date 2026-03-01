"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLogout } from "@/features/auth/useLogout";
import { User } from "@/types/api/user";

type Props = {
  userProfile: User;
};

export const UserMenu = ({ userProfile }: Props) => {
  const { handleLogout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative" ref={menuRef}>
      {/* アイコン（クリックでメニュー開閉） */}
      <button
        type="button"
        onClick={toggle}
        className="w-10 h-10 relative rounded-full overflow-hidden border border-gray-200 cursor-pointer"
      >
        <Image
          src={userProfile.profileImageUrl}
          alt={userProfile.userName}
          fill
          className="object-cover"
        />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-48 bg-white shadow-lg rounded-md border border-gray-100 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">ログイン中</p>
            <p className="text-sm font-semibold truncate">
              {userProfile.userName}
            </p>
          </div>
          <nav className="py-1 text-sm">
            <Link
              href="/dashboard/articles"
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              記事管理
            </Link>
            <Link
              href="/settings/profile"
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              設定
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-500 cursor-pointer"
            >
              ログアウト
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

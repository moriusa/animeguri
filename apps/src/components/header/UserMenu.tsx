"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLogout } from "@/features/auth/useLogout";

type Props = {
  userProfile: {
    user_name: string;
    profile_image_url: string;
  };
};

export const UserMenu = ({ userProfile }: Props) => {
  const { handleLogout } = useLogout();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative" ref={menuRef}>
      {/* アイコン（クリックでメニュー開閉） */}
      <button
        type="button"
        onClick={toggle}
        className="w-10 h-10 relative rounded-full overflow-hidden border border-gray-200 cursor-pointer"
      >
        <Image
          src={userProfile.profile_image_url}
          alt={userProfile.user_name}
          fill
          className="object-cover"
        />
      </button>

      {/* ドロップダウンメニュー */}
      {open && (
        <div className="absolute right-0 top-12 w-48 bg-white shadow-lg rounded-md border border-gray-100 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">ログイン中</p>
            <p className="text-sm font-semibold truncate">
              {userProfile.user_name}
            </p>
          </div>
          <nav className="py-1 text-sm">
            <Link
              href="/dashboard/articles"
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              記事管理
            </Link>
            <Link
              href="/settings/profile"
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              設定
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleLogout();
              }}
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

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBookmark } from 'react-icons/fa6';
import { MdOutlineArticle } from 'react-icons/md';

const menuItems = [
  {
    href: '/dashboard/articles',
    label: '投稿記事',
    icon: <MdOutlineArticle size={20}/>,
  },
  {
    href: '/dashboard/bookmarks',
    label: 'ブックマーク',
    icon: <FaBookmark size={16}/>,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-full
              font-medium transition-all
              ${
                isActive
                  ? 'bg-[#5c3d2e] text-white shadow-lg'
                  : 'text-[#5c3d2e] hover:bg-[#d4c4b5]'
              }
            `}
          >
            <span className={isActive ? '' : 'opacity-60'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
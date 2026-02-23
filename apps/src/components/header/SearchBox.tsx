import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

export const SearchBox = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [queryType, setQueryType] = useState<"anime" | "location">("anime");
  const [queryValue, setQueryValue] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const articlesLimit = 20;
    router.push(`/search?limit=${articlesLimit}&${queryType}=${queryValue}`);
  };

  return (
    <form
      className="bg-white flex items-center border-2 rounded-md"
      onSubmit={handleSubmit}
    >
      <div
        className="cursor-pointer focus:outline-none font-bold p-1 relative"
        ref={menuRef}
      >
        <button
          type="button"
          className="cursor-pointer focus:outline-none"
          onClick={toggle}
        >
          {queryType === "anime" ? "アニメ名" : "聖地の場所"}
        </button>

        {open && (
          <div className="absolute left-0 top-10 bg-white shadow-lg rounded-md border border-gray-100 z-50 whitespace-nowrap py-1">
            <button
              type="button"
              onClick={() => {
                setQueryType("anime");
                setOpen(false);
              }}
              className="block px-3 py-2 hover:bg-gray-50 w-full text-left cursor-pointer"
            >
              アニメ名
            </button>
            <button
              type="button"
              onClick={() => {
                setQueryType("location");
                setOpen(false);
              }}
              className="block px-3 py-2 hover:bg-gray-50 w-full text-left cursor-pointer"
            >
              聖地の場所
            </button>
          </div>
        )}
      </div>
      <input
        type="text"
        className="border-l-2 focus:outline-none p-2"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
      />
      <button className="p-2" type="submit">
        <FaSearch size={20} className="cursor-pointer" />
      </button>
    </form>
  );
};

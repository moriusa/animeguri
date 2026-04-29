import { FC } from "react";
import { FaPenNib } from "react-icons/fa6";

export const PostButton: FC = () => {
  return (
    <button
      className={`bg-[rgb(254,196,99)] shadow-[0px_2px_0px] flex items-center justify-between gap-1 transition-all duration-200 cursor-pointer hover:translate-y-[2px] hover:shadow-none rounded-md py-2 px-3 sm:rounded-3xl sm:py-2 sm:px-5`}
    >
      <FaPenNib />
      <p className="hidden sm:block">投稿</p>
    </button>
  );
};

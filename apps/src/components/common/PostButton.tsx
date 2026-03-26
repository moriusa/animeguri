import { FC } from "react";
import { FaPenNib } from "react-icons/fa6";

export const PostButton: FC = () => {
  return (
    <button
      className={`bg-[rgb(254,196,99)] shadow-[0px_2px_0px] rounded-3xl py-2 px-5 flex items-center justify-between gap-1 transition-all duration-200 cursor-pointer hover:translate-y-[2px] hover:shadow-none`}
    >
      <FaPenNib />
      <p>投稿</p>
    </button>
  );
};

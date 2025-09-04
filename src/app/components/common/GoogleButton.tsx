import React from "react";

interface Props {
  text: string;
}

// TODO OAuth追加時に追加修正

export const GoogleButton = ({ text }: Props) => {
  return (
    <div className="w-full border border-gray-300 rounded-sm p-3 flex gap-2 items-center justify-center cursor-pointer hover:bg-gray-100">
      <img src="/google_logo.svg" alt="" className="w-8" />
      <p>{text}</p>
    </div>
  );
};

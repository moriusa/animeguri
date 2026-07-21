import React, { useState } from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { MarkdownRenderer } from "../article/MarkdownRederer";

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  name: Path<T>;
  validation?: object;
  error?: string;
  text: string;
  placeholder?: string;
  value: string;
}

export const TextArea = <T extends FieldValues>({
  register,
  name,
  validation,
  error,
  text,
  placeholder,
  value,
}: Props<T>) => {
  const [isPreview, setIsPreview] = useState(false);
  return (
    <div>
      <div className="flex gap-2 items-center">
        <p className="font-bold">{text}</p>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
      <div className="flex gap-2 my-2">
        <button
          type="button"
          onClick={() => setIsPreview(false)}
          className={`cursor-pointer px-3 py-1 text-xs font-bold rounded ${
            !isPreview ? "bg-stone-800 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setIsPreview(true)}
          className={`cursor-pointer px-3 py-1 text-xs font-bold rounded ${
            isPreview ? "bg-stone-800 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>
      {isPreview && (
        <div className="border-2 border-dashed border-gray-400 p-2 overflow-y-auto">
          <MarkdownRenderer content={value} />
        </div>
      )}
      <div className={isPreview ? "hidden" : "block"}>
        <textarea
          id={name}
          {...register(name, validation)}
          placeholder={placeholder}
          onInput={(e) => {
            const textarea = e.target as HTMLTextAreaElement;
            textarea.style.height = "auto"; // 高さをリセット
            textarea.style.height = `${textarea.scrollHeight}px`; // 必要な高さを設定
          }}
          className="min-h-40 leading-4.5 bg-white w-full rounded-sm border border-gray-300 px-2 py-1.5 focus:outline-none transition duration-15 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/60 resize-none overflow-hidden"
          // style={{ minHeight: "50px", lineHeight: "1.5" }}
        />
      </div>
    </div>
  );
};

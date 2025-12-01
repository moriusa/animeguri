import React from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  name: Path<T>;
  validation?: object;
  error?: string;
  text: string;
  placeholder?: string;
}

export const TextArea = <T extends FieldValues>({
  register,
  name,
  validation,
  error,
  text,
  placeholder,
}: Props<T>) => {
  return (
    <label htmlFor={name}>
      <div className="flex gap-2 items-center">
        <p className="font-bold">{text}</p>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
      <textarea
        id={name}
        {...register(name, validation)}
        placeholder={placeholder}
        onInput={(e) => {
          const textarea = e.target as HTMLTextAreaElement;
          textarea.style.height = "auto"; // 高さをリセット
          textarea.style.height = `${textarea.scrollHeight}px`; // 必要な高さを設定
        }}
        className="min-h-40 leading-4.5 bg-white w-full rounded-sm border border-gray-300 p-1 focus:outline-none transition duration-15 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/60 resize-none overflow-hidden"
        // style={{ minHeight: "50px", lineHeight: "1.5" }}
      />
    </label>
  );
};

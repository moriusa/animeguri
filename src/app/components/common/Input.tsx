"use client";
import { useState } from "react";
import { UseFormRegister, FieldValues, Path } from "react-hook-form";
import { PiEyeSlashFill } from "react-icons/pi";
import { PiEye } from "react-icons/pi";

interface Props<T extends FieldValues> {
  id: string;
  text: string;
  type?: string;
  placeholder?: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  validation?: object;
  error?: string; // エラーメッセージ用
  mask?: true;
}

export const Input = <T extends FieldValues>({
  id,
  text,
  type = "text",
  placeholder = "",
  name,
  register,
  validation,
  error,
  mask,
}: Props<T>) => {
  const [isVisible, setIsVisible] = useState(false);
  const handleToggle = () => {
    setIsVisible(!isVisible);
  };
  return (
    <div className="w-full">
      <label htmlFor={id}>
        <div className="flex gap-2 items-center">
          <p className="font-bold">{text}</p>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
        <div className="flex items-center">
          <input
            id={id}
            type={isVisible ? type : "text"}
            className="bg-white w-full rounded-sm border border-gray-300 p-1 focus:outline-none transition duration-15 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/60"
            placeholder={placeholder}
            {...register(name, validation)}
          />
          {mask ? (
            isVisible ? (
              <PiEyeSlashFill
                size={28}
                color="#5F5F5F"
                className="ml-3 cursor-pointer"
                onClick={handleToggle}
              />
            ) : (
              <PiEye
                size={28}
                color="#5F5F5F"
                className="ml-3 cursor-pointer"
                onClick={handleToggle}
              />
            )
          ) : null}
        </div>
      </label>
    </div>
  );
};

import React from "react";
import { UseFormRegister } from "react-hook-form";
import { PostFormValues } from "./PostFrom";

export const SelectField = ({
  id,
  label,
  name,
  register,
  validation,
  error,
  options,
  placeholder,
  disabled = false,
  onChangeProp,
  required = false
}: {
  id: string;
  label: string;
  name: Parameters<UseFormRegister<PostFormValues>>[0];
  register: UseFormRegister<PostFormValues>;
  validation?: Record<string, unknown>;
  error?: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChangeProp?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="font-bold">
      {label}
      {required && <span className="text-red-500 ml-1">&#42;</span>}
    </label>
    <select
      id={id}
      {...register(name, validation)}
      disabled={disabled}
      className={`
        w-full rounded border px-3 py-2 text-sm bg-white
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        ${error ? "border-red-400" : "border-gray-300"}
      `}
      onChange={(e) => {
        register(name, validation).onChange(e);
        onChangeProp?.(e);
      }}
    >
      <option value="" disabled hidden>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

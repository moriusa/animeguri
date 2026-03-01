import React, { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  btnColor?: "white" | "blown" | "red";
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({
  text,
  btnColor = "blown",
  disabled = false,
  ...props
}) => {
  let color: string;
  switch (btnColor) {
    case "white":
      color =
        "bg-white text-black border-1 border-gray-500 opacity-70 hover:opacity-100";
      break;
    case "blown":
      color = `bg-secondary text-white`;
      break;
    case "red":
      color = `bg-red-600 text-white hover:bg-red-700`;
      break;
  }
  let disabledStyle: string;
  if (disabled) {
    disabledStyle = "opacity-50 cursor-not-allowed";
  } else {
    disabledStyle = "cursor-pointer hover:opacity-90";
  }
  return (
    <button
      className={`${color} rounded-md p-2 w-full font-medium transition-colors ${disabledStyle}`}
      disabled={disabled}
      {...props}
    >
      {text}
    </button>
  );
};

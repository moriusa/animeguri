import React, { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  btnColor?: "white" | "blown";
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
      color = "bg-white text-black border-1 border-gray-300";
      break;
    case "blown":
      color = `bg-secondary text-white`;
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
      className={`${color} rounded-md p-2 w-full font-bold ${disabledStyle}`}
      {...props}
    >
      {text}
    </button>
  );
};

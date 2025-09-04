import React, { ButtonHTMLAttributes, FC } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  btnColor?: "white" | "blown";
}

export const Button: FC<ButtonProps> = ({
  text,
  btnColor = "blown",
  ...props
}) => {
  let color: string = "white";
  switch (btnColor) {
    case "white":
      color = "bg-white text-black border-1 border-gray-300";
      break;
    case "blown":
      color = "bg-secondary text-white";
      break;
  }
  return (
    <button
      className={`${color} cursor-pointer rounded-md p-2 w-full hover:opacity-90 font-bold`}
      {...props}
    >
      {text}
    </button>
  );
};

interface Props {
  text: string;
}

export const Button = ({ text }: Props) => {
  return (
    <button
      className={`bg-secondary text-white cursor-pointer rounded-md p-2 w-full hover:opacity-90 font-bold`}
    >
      {text}
    </button>
  );
};

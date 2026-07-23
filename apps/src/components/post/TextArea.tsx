import { useCallback, useState } from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import { MarkdownRenderer } from "../article/MarkdownRenderer";

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
  // 高さを調整する共通関数
  const adjustHeight = (elem: HTMLTextAreaElement | null) => {
    if (!elem) return;
    elem.style.height = "auto";
    elem.style.height = `${elem.scrollHeight}px`;
  };

  // register の ref と 自前の高さ調整ロジックを合体させる
  const { ref: registerRef, ...registerProps } = register(name, validation);

  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      // 1. react-hook-form 側に ref を渡す
      registerRef(node);

      // 2. 初期データが入った状態でDOMがバインドされたら、即座に高さを調整する
      if (node) {
        adjustHeight(node);
      }
    },
    [registerRef],
  );
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
        <div className="min-h-40 border-2 border-dashed border-gray-400 p-2 overflow-y-auto bg-white">
          <MarkdownRenderer content={value} />
        </div>
      )}
      <div className={isPreview ? "hidden" : "block"}>
        <textarea
          id={name}
          {...registerProps}
          ref={textareaRef}
          placeholder={placeholder}
          onInput={(e) => adjustHeight(e.currentTarget)}
          className="min-h-40 leading-relaxed bg-white w-full rounded-sm border border-gray-300 px-2 py-1.5 focus:outline-none transition duration-15 focus:bg-orange-50 focus:ring-2 focus:ring-orange-500/60 resize-none overflow-hidden"
        />
      </div>
    </div>
  );
};

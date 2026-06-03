import { useAnimeSearch } from "@/features/articles/hooks/useAnimeSearch";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { PostFormValues } from "../post/PostFrom";
import { Input } from "../common";
import { useEffect, useRef } from "react";

interface Props {
  register: UseFormRegister<PostFormValues>;
  setValue: UseFormSetValue<PostFormValues>;
  errors: FieldErrors<PostFormValues>;
}

export const InputAnime = ({ register, setValue, errors }: Props) => {
  const { setAnimeQuery, animeSuggestions, isAnimeLoading } = useAnimeSearch();
  // 💡 1. サジェストエリア全体を監視するための ref を作成
  const containerRef = useRef<HTMLDivElement>(null);

  // 💡 2. 画面全体のタップ（クリック）を監視する useEffect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // クリックされた要素が、containerRef（サジェストエリア全体）の外側だった場合
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setAnimeQuery(""); // 🚀 検索クエリを空にしてサジェストを閉じる
      }
    };

    // PCのクリックと、スマホのタップ（touchstart）の両方を登録
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    // コンポーネントが消えるときにイベントリスナーを解除（メモリリーク防止）
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setAnimeQuery]);
  return (
    <div className="mt-8 relative" ref={containerRef}>
      <Input
        id={"animeName"}
        text="アニメ名"
        name={"animeName"}
        register={register}
        placeholder="アニメ名を入力"
        validation={{ required: "アニメ名を入力してください" }}
        error={errors?.animeName?.message}
        required={true}
        autoComplete={false}
        onChange={(e) => {
          setAnimeQuery(e.target.value);
        }}
      />
      {/* カスタム・サジェストパネル */}
      {animeSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 border border-gray-200 bg-white rounded shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 animate-in fade-in slide-in-from-top-1 duration-100">
          {animeSuggestions.map((anime) => (
            <button
              key={anime.id}
              type="button"
              onClick={() => {
                setValue("animeName", anime.title);
                setAnimeQuery(""); // 選択したら閉じる
              }}
              className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-yellow-500/10 hover:text-yellow-700 transition-colors flex items-center justify-between group"
            >
              <span className="truncate">{anime.title}</span>
              <span className="text-[10px] font-mono text-neutral-400 group-hover:text-yellow-600 tracking-wider shrink-0 ml-2">
                SELECT
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

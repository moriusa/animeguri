import { useState, useEffect } from "react";
import { searchAnimeAction } from "../searchAnime";

interface AnimeSuggestion {
  id: number;
  title: string;
}

export function useAnimeSearch() {
  const [animeQuery, setAnimeQuery] = useState<string>("");
  const [animeSuggestions, setAnimeSuggestions] = useState<AnimeSuggestion[]>(
    [],
  );
  const [isAnimeLoading, setIsAnimeLoading] = useState<boolean>(false);

  useEffect(() => {
    if (animeQuery.trim().length < 1) {
      setAnimeSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsAnimeLoading(true);
      try {
        const data = await searchAnimeAction(animeQuery);

        if (data && !("error" in data) && Array.isArray(data)) {
          console.log("come")
          setAnimeSuggestions(data);
        }
      } catch (err) {
        console.error("フック内サジェスト取得エラー:", err);
      } finally {
        setIsAnimeLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [animeQuery]);

  return {
    animeQuery,
    setAnimeQuery,
    animeSuggestions,
    isAnimeLoading,
  };
}

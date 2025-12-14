import React, { useEffect, useState } from "react";
import { SubTitle } from "./common/SubTitle";
import { ArticleCard } from "./common/ArticleCard";
import { getArticleCards } from "@/lib/articles";
import { ArticleCard as ArticleCardType } from "@/types";

interface Props {
  type:
    | "popularArticles"
    | "followArticles"
    | "latestArticles"
    | "latestComments"
    | "monthlyAnimeArticleRanking";
}

export default function HomeArticles({ type }: Props) {
  const [articles, setArticles] = useState<ArticleCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const fetchedArticles = await getArticleCards(10);
        console.log(fetchedArticles)
        setArticles(fetchedArticles);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError(
          err instanceof Error ? err.message : "記事の取得に失敗しました"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [type]); // typeが変わったら再取得

  if (loading) return <p>loading</p>;
  if (error) return <p>fetchError</p>;

  return (
    <div>
      <div>
        <SubTitle type={type} />
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-2 mt-5 justify-center">
          {articles.map((article) => (
            <ArticleCard data={article} key={article.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

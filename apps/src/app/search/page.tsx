"use client";
import { ArticleCard } from "@/components/common/ArticleCard";
import { useGetArticleCards } from "@/features/articles/hooks/useGetArticleCards";
import { useSearchParams } from "next/navigation";

const DEFAULT_LIMIT = 20;

const Page = () => {
  const sp = useSearchParams();

  const anime = sp.get("anime");
  const location = sp.get("location");

  const limitRaw = sp.get("limit");
  const limitNum = limitRaw ? Number(limitRaw) : NaN;
  const limit =
    Number.isFinite(limitNum) && limitNum > 0 ? limitNum : DEFAULT_LIMIT;

  const { articles, isLoading, error } = useGetArticleCards(limit, {
    anime,
    location,
  });

  if (!articles) return <p>article not found</p>;
  if (isLoading) return <p>loading</p>;
  if (error) return <p>fetchError</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1>検索結果</h1>
      <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-2 mt-5 justify-center">
        {articles.map((article) => (
          <ArticleCard data={article} key={article.id} />
        ))}
      </div>
    </div>
  );
};

export default Page;

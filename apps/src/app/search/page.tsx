"use client";
import { ArticleCard } from "@/components/common/ArticleCard";
import { useGetArticleCards } from "@/features/articles/useGetArticleCards";
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

  const { articles, loading, error } = useGetArticleCards(limit, {
    anime,
    location,
  });

  if (!articles) return <p>article not found</p>;
  if (loading) return <p>loading</p>;
  if (error) return <p>fetchError</p>;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-2 mt-5 justify-center">
      {articles.data.map((article) => (
        <ArticleCard data={article} key={article.id} />
      ))}
    </div>
  );
};

export default Page;

import { SubTitle } from "./common/SubTitle";
import { ArticleCard } from "./common/ArticleCard";
import { useGetArticleCards } from "@/features/articles/hooks/useGetArticleCards";

interface Props {
  type:
    | "popularArticles"
    | "followArticles"
    | "latestArticles"
    | "latestComments"
    | "monthlyAnimeArticleRanking";
}

export default function HomeArticles({ type }: Props) {
  const { articles, error, isLoading } = useGetArticleCards(20);

  if (!articles) return <p>article not found</p>;
  if (isLoading) return <p>loading</p>;
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

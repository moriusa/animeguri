import { SubTitle } from "./common/SubTitle";
import { ArticleCard } from "./common/ArticleCard";
import { useGetHomeArticleCards } from "@/features/articles/useGetHomeArticleCards";

interface Props {
  type:
    | "popularArticles"
    | "followArticles"
    | "latestArticles"
    | "latestComments"
    | "monthlyAnimeArticleRanking";
}

export default function HomeArticles({ type }: Props) {
  const {articles, error, loading} = useGetHomeArticleCards()

  if (!articles) return <p>article not found</p>;
  if (loading) return <p>loading</p>;
  if (error) return <p>fetchError</p>;

  return (
    <div>
      <div>
        <SubTitle type={type} />
        <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-2 mt-5 justify-center">
          {articles.data.map((article) => (
            <ArticleCard data={article} key={article.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

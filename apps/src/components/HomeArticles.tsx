import { SubTitle } from "./common/SubTitle";
import { ArticleCard } from "./common/ArticleCard";
import { getArticleCards } from "@/features/articles/hooks/getArticleCards";

interface Props {
  type:
    | "popularArticles"
    | "followArticles"
    | "latestArticles"
    | "latestComments"
    | "monthlyAnimeArticleRanking";
}

export default async function HomeArticles({ type }: Props) {
  const articles = await getArticleCards(20);

  if (!articles.length) return <p>article not found</p>;

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

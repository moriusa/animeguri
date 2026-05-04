import { ArticleCard } from "@/components/common/ArticleCard";
import { getArticleCards } from "@/features/articles/hooks/getArticleCards";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const DEFAULT_LIMIT = 20;

const Page = async ({ searchParams }: Props) => {
  // 1. searchParamsをawaitして取得
  const resolvedSearchParams = await searchParams;

  // 2. 各値を取り出す（Promiseなので直接 .get() は使えず、オブジェクトとしてアクセス）
  const anime =
    typeof resolvedSearchParams.anime === "string"
      ? resolvedSearchParams.anime
      : null;
  const location =
    typeof resolvedSearchParams.location === "string"
      ? resolvedSearchParams.location
      : null;

  const limitRaw = resolvedSearchParams.limit;
  const limitNum = typeof limitRaw === "string" ? Number(limitRaw) : NaN;
  const limit =
    Number.isFinite(limitNum) && limitNum > 0 ? limitNum : DEFAULT_LIMIT;

  // 3. データ取得
  const articles = await getArticleCards(limit, {
    anime: anime ?? undefined,
    location: location ?? undefined,
  });

  if (!articles) return <p>article not found</p>;

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

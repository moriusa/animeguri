import { ArticleContent } from "@/components/article/ArticleContent";
import { Suspense } from "react";

import type { Metadata } from "next";
import { getArticle } from "@/features/articles/hooks/getArticle";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: "記事が見つかりません",
    };
  }

  return {
    title: article.title,
    description: `${article.animeName}の聖地巡礼レポート`,
    openGraph: {
      title: article.title,
      description: `${article.animeName}の聖地巡礼レポート`,
      images: [
        {
          url: article.thumbnailUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: `${article.animeName}の聖地巡礼レポート`,
      images: [article.thumbnailUrl],
    },
  };
}

const Page = ({ params }: Props) => {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <ArticleContent params={params} />
    </Suspense>
  );
};

export default Page;

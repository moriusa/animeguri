import { ArticleContent } from "@/components/article/ArticleContent";
import { Suspense } from "react";

type Props = {
  params: Promise<{ id: string }>;
};

const Page = ({ params }: Props) => {
  return (
    <Suspense fallback={<p>読み込み中...</p>}>
      <ArticleContent params={params} />
    </Suspense>
  );
};

export default Page;

"use client"
import { PostForm, PostFormValues } from "@/components/post/PostFrom";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getArticle } from "@/lib/articles";

// app/post/edit/[id]/page.tsx
const Page = () => {
  const params = useParams();
  const id = params.id as string;
  const [initialData, setInitialData] = useState<PostFormValues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const article = await getArticle(id);
        // APIデータをフォーム形式に変換
        const formData: PostFormValues = {
          id: article.data.id,
          title: article.data.title,
          thumbnail: article.data.thumbnailUrl
            ? {
                url: article.data.thumbnailUrl,
                isExisting: true,
              }
            : null,
          animeName: article.data.animeName,
          reports: article.data.reports.map((report) => ({
            id: report.id,
            title: report.title,
            images: report.reportImages.map((image) => ({
              id: image.id,
              url: image.imageUrl,
              caption: image.caption,
              isExisting: true,
              displayOrder: image.displayOrder,
            })),
            location: report.location,
            description: report.description,
          })),
        };

        setInitialData(formData);
      } catch (error) {
        console.error("記事取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div>読み込み中...</div>;
  if (!initialData) return <div>記事が見つかりません</div>;

  return <PostForm mode="edit" initialData={initialData} />;
};

export default Page;

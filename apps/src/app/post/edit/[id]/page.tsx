"use client";

import { PostForm, PostFormValues } from "@/components/post/PostFrom";
import { useGetMyArticle } from "@/features/articles/hooks/useGetMyArticle";
import { useEffect, useMemo, useState } from "react";

const Page = () => {
  const { article, error, isLoading } = useGetMyArticle();
  const [initialData, setInitialData] = useState<PostFormValues | null>(null);

  // article から formData を作る処理はメモ化しておくと安全
  const formData = useMemo<PostFormValues | null>(() => {
    if (!article) return null;

    return {
      id: article.id,
      title: article.title,
      thumbnail: article.thumbnailUrl
        ? { url: article.thumbnailUrl, isExisting: true }
        : null,
      animeName: article.animeName,
      reports: article.reports.map((report) => ({
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
        latitude: report.latitude,
        longitude: report.longitude,
        geocodedAddress: report.geocodedAddress,
        description: report.description,
      })),
    };
  }, [article]);

  useEffect(() => {
    setInitialData(formData);
  }, [formData]);

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>取得に失敗しました</div>;
  if (!initialData) return <div>記事が見つかりません</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <PostForm mode="edit" initialData={initialData} />
    </div>
  );
};

export default Page;

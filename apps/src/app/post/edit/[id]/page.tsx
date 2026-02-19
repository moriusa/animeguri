"use client";

import { PostForm, PostFormValues } from "@/components/post/PostFrom";
import { useEffect, useMemo, useState } from "react";
import { useGetMyArticle } from "@/features/articles/useGetMyArticle";

const Page = () => {
  const { article, error, loading } = useGetMyArticle();
  const [initialData, setInitialData] = useState<PostFormValues | null>(null);

  // article から formData を作る処理はメモ化しておくと安全
  const formData = useMemo<PostFormValues | null>(() => {
    if (!article) return null;

    return {
      id: article.data.id,
      title: article.data.title,
      thumbnail: article.data.thumbnailUrl
        ? { url: article.data.thumbnailUrl, isExisting: true }
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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>取得に失敗しました</div>;
  if (!initialData) return <div>記事が見つかりません</div>;

  return <PostForm mode="edit" initialData={initialData} />;
};

export default Page;

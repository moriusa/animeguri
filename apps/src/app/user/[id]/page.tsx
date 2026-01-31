"use client";
import { ArticleCard } from "@/components/common/ArticleCard";
import { useGetUserArticleCards } from "@/features/articles/useGetUserArticleCards";
import { useGetPublicUserProfile } from "@/features/user/useGetPublicUserProfile";
import Image from "next/image";

const Page = () => {
  const {
    articles,
    error: articleError,
    loading: articleLoading,
  } = useGetUserArticleCards();
  const {
    profile,
    error: profileError,
    loading: profileLoading,
  } = useGetPublicUserProfile();

  const articleData = articles?.data;

  if(!profile) return <p>プロフィールが見つかりません</p>


  return (
    <div>
      <div className="flex gap-8">
        <div className="w-30 h-30 relative rounded-full overflow-hidden">
          <Image
            src={profile.profileImageUrl}
            alt={""}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="font-bold text-2xl">{profile.userName}</h1>
          <p className="mt-4">{profile.bio}</p>
        </div>
      </div>
      <div className="mt-10">
        <h2 className="font-bold text-2xl">投稿記事一覧</h2>
        {articleData ? (
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-2 mt-5 justify-center">
            {articleData.map((article) => (
              <ArticleCard data={article} key={article.id} />
            ))}
          </div>
        ) : (
          <p>投稿された記事がありません</p>
        )}
      </div>
    </div>
  );
};

export default Page;

import { ArticleCard } from "@/components/common/ArticleCard";
import { getUserArticleCards } from "@/features/articles/hooks/getUserArticleCards";
import { getPublicUserProfile } from "@/features/user/hooks/getPublicUserProfile";
import Image from "next/image";

export const UserProfileContent = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const profile = await getPublicUserProfile(id);
  const articles = await getUserArticleCards(id);

  if (!profile) return <p>プロフィールが見つかりません</p>;

  return (
    <div className="max-w-4xl mx-auto">
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
        {articles ? (
          <div className="grid grid-cols-[repeat(auto-fill,_minmax(200px,_1fr))] gap-2 mt-5 justify-center">
            {articles.map((article) => (
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

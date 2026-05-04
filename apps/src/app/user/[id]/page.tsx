import { UserProfileContent } from "@/components/user/UserProfileContent";
import { Suspense } from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  return (
    <Suspense fallback={<div>プロフィール読み込み中...</div>}>
      <UserProfileContent params={params} />
    </Suspense>
  );
};

export default Page;

export const dynamic = "force-dynamic";
import { PostForm } from "@/components/post/PostFrom";

const Page = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <PostForm mode="create" />
    </div>
  );
};

export default Page;

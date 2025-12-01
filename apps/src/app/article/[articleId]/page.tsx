import { Article, User } from "@/types";
import { JapaneseDateTime } from "@/utils/formatDate";
import Image from "next/image";
import { FaMapMarkerAlt } from "react-icons/fa";

const Dummy: Article = {
  articleId: "12345",
  title: "この聖地に行ってみての感想",
  thumbnailImgUrl: "https://placehold.jp/250x250.png",
  prefectureName: "東京都",
  cityName: "渋谷区",
  animeName: "ポケモン",
  likesCount: 0,
  commentCount: 0,
  postUserId: "12345",
  createdAt: "2024-03-10T15:30:00.000Z",
  updatedAt: "2024-03-10T15:30:00.000Z",
  publishedAt: "2024-03-10T15:30:00.000Z",
  articleStatus: true,
  statusCreatedAt: "true#2024-03-10T15:30:00.000Z",
  prefectureCity: "東京都#渋谷区",
};

const userDummy: User = {
  userId: "12345",
  userName: "John Doe",
  profileImgUrl: "https://placehold.jp/250x250.png",
  bio: "",
  articleCount: 0,
  followingCount: 0,
  createdAt: "",
  updatedAt: "",
};

const page = (data: Article, userData: User) => {
  data = Dummy;
  userData = userDummy;
  const publishedAt = new JapaneseDateTime(data.publishedAt);
  return (
    <div>
      <div className="text-center p-10">
        <Image
          src={data.thumbnailImgUrl}
          alt={""}
          width={250}
          height={250}
          className="m-auto"
        />
        <p className="font-bold text-2xl mt-3">{data.title}</p>
        <p>{publishedAt.toJapanese()}</p>
      </div>
      <div className="bg-white p-5">
        <div className="flex items-center gap-4">
          <Image src={userData.profileImgUrl} alt={""} width={50} height={50} />
          <p>{userData.userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-600">
            <FaMapMarkerAlt size={14} />
          </span>
          <p className="text-gray-500">
            {data.prefectureName}
            {data.cityName}
          </p>
        </div>
        <p>title</p>
        <p>text</p>
      </div>
    </div>
  );
};

export default page;

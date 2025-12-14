import { User } from "./userType";

export interface Article {
  articleId: string;
  title: string;
  thumbnailImgUrl: string;
  prefectureName: string;
  cityName: string;
  animeName: string;
  likesCount: number;
  commentCount: number;
  postUserId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  articleStatus: boolean;
  statusCreatedAt: string;
  prefectureCity: string;
}

// カード記事
export interface ArticleCard {
  id: string;
  title: string;
  thumbnail_url: string;
  anime_name: string;
  likes_count: string;
  comment_count: string;
  published_at: string;
  author: {
    id: string,
    user_name: string,
    profile_image_url: string,
  }
  // author: Pick<User, "userId" | "userName" | "profileImgUrl">;
}
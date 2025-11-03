import { User } from "./userType";

export interface Article {
  articleId: string;
  title: string;
  thumbnailImgUrl: string;
  prefectureName: string;
  cityName: string;
  animeName: string;
  likesCount: string;
  commentCount: string;
  postUserId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  articleStatus: string;
  statusCreatedAt: string;
  prefectureCity: string;
}

// カード記事
export interface ArticleCard {
  articleId: string;
  title: string;
  thumbnailImgUrl: string;
  prefectureName: string;
  cityName: string;
  animeName: string;
  likesCount: string;
  commentCount: string;
  publishedAt: string;
  author: Pick<User, "userId" | "userName" | "profileImgUrl">;
}
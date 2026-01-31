import { ApiResponse, PaginatedResponse } from "../common";
import { User } from "./user";

export interface ReportImage {
  id: string;
  imageUrl: string;
  caption: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  reportId: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  display_order: number;
  articleId: string;
  createdAt: string;
  updatedAt: string;
  reportImages: ReportImage[];
}

export interface Article {
  id: string;
  userId: string;
  title: string;
  animeName: string;
  thumbnailUrl: string;
  likesCount: number;
  commentCount: number;
  reportCount: number;
  articleStatus: "draft" | "public";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  reports: Report[];
  author: Pick<User, "id" | "userName" | "profileImageUrl">;
}

export interface ArticleCard {
  id: string;
  userId: string;
  title: string;
  animeName: string;
  thumbnailUrl: string;
  likesCount: number;
  bookmarkCount: number;
  commentCount: number;
  reportCount: number;
  articleStatus: "draft" | "public";
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: Pick<User, "id" | "userName" | "profileImageUrl">;
}

export type ArticleCardResponse = PaginatedResponse<ArticleCard>;
export type ArticleResponse = ApiResponse<Article>;

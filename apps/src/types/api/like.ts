import { ApiResponse, PaginatedResponse } from "../common";
import { ArticleCard } from "./article";

// export interface AddLike {
//   id: string;
//   userId: string;
//   articleId: string;
//   createdAt: string;
// }

export interface LikeCheck {
  isLiked: boolean;
}

export interface LikeArticleCard {
  id: string;
  createdAt: string;
  article: ArticleCard
}

export type LikeCheckResponse = ApiResponse<LikeCheck>;
// export type AddLikeResponse = ApiResponse<AddLike>;
export type LikeArticleCardResponse =
  PaginatedResponse<LikeArticleCard>;

import { ApiResponse, PaginatedResponse } from "../common";
import { ArticleCard } from "./article";

// export interface AddBookmark {
//   id: string;
//   userId: string;
//   articleId: string;
//   createdAt: string;
// }

export interface BookmarkCheck {
  isBookmarked: boolean;
}

export interface BookmarkArticleCard {
  id: string;
  createdAt: string;
  article: ArticleCard
}

export type BookmarkCheckResponse = ApiResponse<BookmarkCheck>;
// export type AddBookmarkResponse = ApiResponse<AddBookmark>;
export type BookmarkArticleCardResponse =
  PaginatedResponse<BookmarkArticleCard>;

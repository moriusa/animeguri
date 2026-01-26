import { ApiResponse, PaginatedResponse } from "../common";

// export interface AddBookmark {
//   id: string;
//   userId: string;
//   articleId: string;
//   createdAt: string;
// }

export interface BookmarkCheck {
  isBookmarked: boolean;
}

export type BookmarkCheckResponse = ApiResponse<BookmarkCheck>;
// export type AddBookmarkResponse = ApiResponse<AddBookmark>;
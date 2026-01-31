import { ApiResponse } from "../common";

export interface User {
  id: string;
  email: string;
  userName: string;
  profileImageUrl: string;
  bio: string;
  articleCount: number;
  bookmarkCount: number;
  xUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  websiteUrl: string;
  createdAt: string;
}

export type UserResponse = ApiResponse<User>;

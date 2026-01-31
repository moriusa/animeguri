import { User } from "./userType";

export interface ReportsImages {
  id: string;
  s3_key: string;
  caption: string;
  display_order: string;
}

export interface Reports {
  id: string;
  title: string;
  description: string;
  location: string;
  display_order: number;
  report_images: ReportsImages[]
}

export interface Article {
  id: string;
  title: string;
  thumbnail_s3_key: string;
  anime_name: string;
  likes_count: number;
  comment_count: number;
  published_at: string;
  reports: Reports[];
  author: Pick<User, "id" | "user_name" | "profile_image_s3_key">;
}

// カード記事
export interface ArticleCard {
  id: string;
  title: string;
  thumbnail_s3_key: string;
  anime_name: string;
  likes_count: string;
  comment_count: string;
  published_at: string;
  author: Pick<User, "id" | "user_name" | "profile_image_s3_key">;
  article_status: "draft" | "published" | "archived";
}

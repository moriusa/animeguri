import { ApiResponse } from "../common";

export interface PresignedUrl {
  fileName: string;
  imageType: string;
  presignedUrl: string;
  imageId: string;
  s3Key: string;
  publicUrl: number;
  expiresAt: number;
}

export type PresignedUrlResponse = ApiResponse<PresignedUrl[]>;

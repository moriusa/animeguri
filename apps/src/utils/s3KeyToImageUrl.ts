const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

export const s3KeyToImageUrl = (s3Key: string) =>
  `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;

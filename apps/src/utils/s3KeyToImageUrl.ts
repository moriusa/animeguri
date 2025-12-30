const CLOUDFRONT_DOMAIN = "d3a3hx04n9m6jc.cloudfront.net";

export const s3KeyToImageUrl = (s3Key: string) =>
  `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;

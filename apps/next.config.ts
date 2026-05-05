import type { NextConfig } from "next";
const CLOUDFRONT_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN!;

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // プレースホルダー画像(仮置き用なので、本番で下記削除)
      {
        protocol: "https",
        hostname: "placehold.jp",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: CLOUDFRONT_DOMAIN,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "animeguri-images.s3.ap-northeast-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

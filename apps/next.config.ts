import type { NextConfig } from "next";

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
        hostname: "d3gzga84fhq0dj.cloudfront.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "animeguri-public-images.s3.ap-northeast-1.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  cacheComponents: true,
};

export default nextConfig;

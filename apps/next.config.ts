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
      // CLOUDFRONT_DOMAINが存在する場合のみ追加
      ...(CLOUDFRONT_DOMAIN
        ? [
            {
              protocol: "https" as const,
              hostname: CLOUDFRONT_DOMAIN,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

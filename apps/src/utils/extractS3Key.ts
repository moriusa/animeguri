/**
 * CloudFront URL または S3 key から S3 key を抽出
 */
export const extractS3Key = (value: string): string => {
  // CloudFront URL の場合
  if (value.startsWith("https://") || value.startsWith("http://")) {
    try {
      const url = new URL(value);
      // "/uploads/..." → "uploads/..."
      return url.pathname.slice(1); // 先頭の "/" を削除
    } catch (error) {
      console.error("Invalid URL:", value);
    }
  }

  // 既に S3 key の場合はそのまま返す
  return value;
};

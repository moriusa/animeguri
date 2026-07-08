interface RakutenBookItem {
  affiliateUrl: string;
  artistName: string;
  author: string;
  availability: string;
  booksGenreId: string;
  chirayomiUrl: string;
  discountPrice: number;
  discountRate: number;
  hardware: string;
  isbn: string;
  itemCaption: string;
  itemPrice: number;
  itemUrl: string;
  jan: string;
  label: string;
  largeImageUrl: string;
  limitedFlag: number;
  listPrice: number;
  mediumImageUrl: string;
  os: string;
  postageFlag: number;
  publisherName: string;
  reviewAverage: string;
  reviewCount: number;
  salesDate: string;
  smallImageUrl: string;
  title: string;
}

interface RakutenItemWrapper {
  Item: RakutenBookItem;
}

export interface RakutenBooksResponse {
  Items: RakutenItemWrapper[];
}

export const fetchRakutenAds = async (
  animeName: string,
): Promise<RakutenBooksResponse> => {
  const RAKUTEN_APP_ID = process.env.RAKUTEN_APPLICATION_ID;
  const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID;
  const RAKUTEN_ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY;
  const sort = "sales";
  const itemLen = 18;
  const REGISTERED_SITE_URL = "https://www.animeguri.app";

  const res = await fetch(
    `https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404?applicationId=${RAKUTEN_APP_ID}&accessKey=${RAKUTEN_ACCESS_KEY}&affiliateId=${RAKUTEN_AFFILIATE_ID}&keyword=${encodeURIComponent(animeName)}&sort=${sort}&hits=${itemLen}`,
    {
      headers: {
        Origin: REGISTERED_SITE_URL,
        Referer: REGISTERED_SITE_URL,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 86400, tags: ["rakuten-ads"] }, // 1日
    },
  );
  return res.json();
};

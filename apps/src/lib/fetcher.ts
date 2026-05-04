import { getValidIdToken } from "./common/authFetch";

interface FetcherOptions extends RequestInit {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  headers?: Record<string, string>;
}

export const fetcher = async <T>(
  url: string,
  cacheTime?: number,
): Promise<T> => {
  const res = await fetch(url, {
    next: { revalidate: cacheTime },
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }

  return res.json();
};

export const authFetcher = async <T>(
  url: string,
  options?: FetcherOptions,
): Promise<T> => {
  const token = await getValidIdToken();
  if (!token) {
    throw new Error("認証トークンが取得できません");
  }
  const res = await fetch(url, {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: options?.body,
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  // DELETEなどレスポンスボディがない場合の対応
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
};

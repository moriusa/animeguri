"use server";

export async function searchAnimeAction(query: string) {
  if (!query || query.trim().length < 1) {
    return [];
  }

  const token = process.env.ANNICT_ACCESS_TOKEN;
  if (!token) {
    console.error("Error: ANNICT_ACCESS_TOKEN が設定されていません。");
    return { error: "Server Configuration Error" };
  }

  try {
    const annictUrl = `https://api.annict.com/v1/works?filter_title=${encodeURIComponent(query)}&sort_id=desc&per_page=10`;

    const res = await fetch(annictUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Annict API error");

    const data: Response = await res.json();
    type Response = {
      works: {
        id: number;
        title: string;
        title_kana: string;
        title_en: string;
        media: string;
        media_text: string;
        released_on: string;
        released_on_about: string;
        official_site_url: string;
        wikipedia_url: string;
        twitter_username: string;
        twitter_hashtag: string;
        syobocal_tid: string;
        mal_anime_id: string;
        images: [object];
        episodes_count: number;
        watchers_count: number;
        reviews_count: number;
        no_episodes: false;
        season_name: string;
        season_name_text: string;
      }[];
    };
    return (data.works || []).map((work) => ({
      id: work.id,
      title: work.title,
    }));
  } catch (error) {
    console.error("Server Action内でのエラー:", error);
    return { error: "Internal Server Error" };
  }
}

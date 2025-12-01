export class JapaneseDateTime {
  private date: Date;

  constructor(isoString: string) {
    this.date = new Date(isoString); // 一度だけ作成
  }

  toJST(): string {
    return this.date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  }

  toJapanese(): string {
    return this.date.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      // weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}

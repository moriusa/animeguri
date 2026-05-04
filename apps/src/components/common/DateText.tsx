"use client";

import { daysAgoConvert } from "@/utils/daysAgoConvert";
import { useEffect, useState } from "react";

export function DateText({ date }: { date: string }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    // ブラウザで実行されるため、new Date() を使ってもエラーにならない
    setFormatted(daysAgoConvert(new Date(date)));
  }, [date]);

  // 初回レンダリング時は空文字（またはスケルトン）にしてズレを防ぐ
  return <p>{formatted}</p>;
}
export const daysAgoConvert = (createdAt: Date) => {
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - createdAt.getTime();

  const minutesDifference = Math.floor(timeDifference / (1000 * 60)); // 分単位の差
  const hoursDifference = Math.floor(timeDifference / (1000 * 3600)); // 時間単位の差
  // 1000 (ミリ秒/秒) * 3600 (秒/時間) * 24 (時間/日) = 86,400,000 ミリ秒/日 Math.floorで切り捨て
  const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  if (daysDifference === 0) {
    if (hoursDifference === 0) {
      return `${minutesDifference}分前`; // 1時間未満の場合
    }
    return `${hoursDifference}時間前`; // 1日未満の場合
  } else {
    return `${daysDifference}日前`;
  }
};

import React from "react";
import { FaFire, FaRegComment, FaRegCalendarCheck } from "react-icons/fa6";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { GiLaurelsTrophy } from "react-icons/gi";

interface Props {
  type:
    | "popularArticles"
    | "followArticles"
    | "latestArticles"
    | "latestComments"
    | "monthlyAnimeArticleRanking"
}

export const SubTitle = ({ type }: Props) => {
  const typeOptions = {
    popularArticles: {
      icon: <FaFire size={28} />,
      title: "人気記事",
    },
    followArticles: {
      icon: <MdOutlinePeopleAlt size={28} />,
      title: "フォロー",
    },
    latestArticles: {
      icon: <FaRegCalendarCheck size={28} />,
      title: "最新記事",
    },
    latestComments: {
      icon: <FaRegComment size={28} />,
      title: "最新コメント",
    },
    monthlyAnimeArticleRanking: {
      icon: <GiLaurelsTrophy size={28} />,
      title: "今月のアニメ別記事投稿数",
    },
  };

  const { icon, title } = typeOptions[type];

  return (
    <div className="flex gap-1 items-center">
      {icon}
      <h2 className="font-bold text-xl">{title}</h2>
    </div>
  );
};

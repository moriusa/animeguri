import React from "react";
import {
  XEmbed,
  InstagramEmbed,
  TikTokEmbed,
  YouTubeEmbed,
} from "react-social-media-embed";

interface SocialEmbedProps {
  url: string;
}

export const SocialEmbed: React.FC<SocialEmbedProps> = ({ url }) => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return (
      <div className="my-4 max-w-140 mx-auto">
        <YouTubeEmbed url={url} width="100%" />
      </div>
    );
  }
  if (url.includes("instagram.com")) {
    return (
      <div className="my-4 max-w-82 mx-auto">
        <InstagramEmbed url={url} width="100%" />
      </div>
    );
  }
  if (url.includes("tiktok.com")) {
    return (
      <div className="my-4 max-w-81.25 mx-auto">
        <TikTokEmbed url={url} width="100%" />
      </div>
    );
  }
  if (url.includes("twitter.com") || url.includes("x.com")) {
    return (
      <div className="my-4 max-w-137.5 mx-auto">
        <XEmbed url={url} width="100%" />
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-yellow-600 underline"
    >
      {url}
    </a>
  );
};

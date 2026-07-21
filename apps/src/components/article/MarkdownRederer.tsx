"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SocialEmbed } from "./SocialEmbed";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <div className="prose max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // リンク (aタグ) がレンダリングされる時の挙動をハックする
          a: ({ href, children }) => {
            const url = href || "";

            // 1. マークダウンに `https://...` と直貼りされた場合
            //    (Markdownパーサーは、テキストとリンク先が同じ場合 `children` にもURLの文字列を入れます)
            const isUrlDirectLink = children === url;

            if (isUrlDirectLink) {
              // 自作のSNS埋め込み判定コンポーネントにURLを投げてすり替える
              return <SocialEmbed url={url} />;
            }

            // 2. 通常の `[テキスト](URL)` の形式だった場合は、通常の安全なリンクとして表示する
            return (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#f0c24d] hover:underline font-bold"
              >
                {children}
              </a>
            );
          },
          h2: ({ children }) => (
            <h2 className="text-xl font-black text-[#5c3d2e] border-l-4 border-[#f0c24d] pl-3 my-6">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-[#5c3d2e] my-4">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <div className="whitespace-pre-wrap">{children}</div>
          ),
          hr: () => (
            <hr className="border-t-2 border-dashed border-gray-300 my-8" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

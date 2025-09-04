// import React from "react";
// import { Article, User } from "@backend/types/prismaTypes";
// import Link from "next/link";
// import { FaMapMarkerAlt, FaRegHeart, FaRegComment } from "react-icons/fa";
// import { daysAgoConvert } from "@/utils";

// export interface ArticleType extends Article {
//   user: User;
// }

// export const ArticleCard = ({ article }: { article: ArticleType }) => {
//   console.log(article.createdAt);
//   return (
//     <div className="rounded bg-secondary text-xs">
//       <Link href={`/article/${article.id}`}>
//         <p className="py-1 px-2 text-white">{article.animeName}</p>
//         <img
//           src={article.thumbnailImageURL}
//           alt=""
//           className="aspect-video object-cover"
//         />
//         <div className="bg-white p-3 text-gray-500">
//           <p className="text-black text-base font-bold line-clamp-2 h-[48px]">
//             {article.title}
//           </p>
//           <div className="flex items-center gap-1 mt-3">
//             <FaMapMarkerAlt size={14} />
//             <p>
//               {article.prefectureName} {article.cityName}
//             </p>
//           </div>
//           <div className="flex items-center gap-1 mt-3">
//             <img
//               src={article.user.imageURL}
//               alt=""
//               className="w-7 rounded-full"
//             />
//             <p className="line-clamp-1">{article.user.name}</p>
//           </div>
//           <div className="flex justify-between items-center mt-3">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-0.5">
//                 <FaRegHeart />
//                 <p>{article.likesCount}</p>
//               </div>
//               <div className="flex items-center gap-0.5">
//                 <FaRegComment />
//                 <p>{article.commentsCount}</p>
//               </div>
//             </div>
//             <p className="">{daysAgoConvert(article.createdAt)}</p>
//           </div>
//         </div>
//       </Link>
//     </div>
//   );
// };

// マーカーDOM生成
import { Report } from "@/types/api/article";

export const createMarkerElement = (report: Report): HTMLElement => {
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.style.cssText = "width:44px; height:44px; cursor:pointer;";

  const inner = document.createElement("div");
  inner.className = "custom-marker-inner";

  const thumbnailUrl =
    report.reportImages?.[0]?.imageUrl || "/defaults/no-image.jpg";

  inner.style.cssText = `
    width: 40px;
    height: 40px;
    background-image: url(${thumbnailUrl});
    background-size: cover;
    background-position: center;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;

  // ホバー
  el.addEventListener("mouseenter", () => {
    inner.style.transform = "scale(1.3)";
  });
  el.addEventListener("mouseleave", () => {
    if (!el.classList.contains("selected")) {
      inner.style.transform = "scale(1)";
    }
  });

  el.appendChild(inner);
  return el;
};
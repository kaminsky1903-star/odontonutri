import { useEffect } from "react";
import { SITE_NAME } from "../site";

const ROBOTS_VALUE = "noindex, nofollow, noarchive";
const META_NAMES = ["robots", "googlebot", "bingbot"] as const;

function applyMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  const created = !element;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("name", name);
    document.head.appendChild(element);
  }
  const previous = element.getAttribute("content");
  element.setAttribute("content", content);
  return () => {
    if (created) {
      element?.remove();
      return;
    }
    if (previous) {
      element?.setAttribute("content", previous);
      return;
    }
    element?.removeAttribute("content");
  };
}

export function useAdminSeo() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `Panel de analíticas | ${SITE_NAME}`;
    const restorers = META_NAMES.map((name) => applyMeta(name, ROBOTS_VALUE));
    return () => {
      document.title = previousTitle;
      for (const restore of restorers) {
        restore();
      }
    };
  }, []);
}

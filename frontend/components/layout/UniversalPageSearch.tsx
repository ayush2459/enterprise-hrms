"use client";

import { useEffect } from "react";
import { usePageSearch } from "@/components/layout/PageSearchContext";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export function UniversalPageSearch() {
  const { query } = usePageSearch();

  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;

    const q = normalize(query);

    /*
     * Never filter the command center/top controls.
     * Only search actual content records.
     */
    const selectors = [
      "main table tbody tr",
      "main [role='row']",
      "main [data-search-item]",
      "main li[data-search-item]",
      "main article[data-search-item]",
    ];

    const filter = () => {
      const activeQuery = normalize(
        new URLSearchParams(window.location.search).get("q") || q
      );

      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(selectors.join(","))
      );

      /*
       * If the page has explicitly marked searchable records,
       * use those first.
       */
      if (nodes.length === 0) return;

      let visible = 0;

      nodes.forEach((node) => {
        const text = normalize(node.innerText || node.textContent || "");

        const match =
          !activeQuery ||
          text.includes(activeQuery);

        node.style.display = match ? "" : "none";

        if (match) visible += 1;
      });

      let empty = root.querySelector(
        "[data-universal-search-empty]"
      ) as HTMLElement | null;

      if (activeQuery && visible === 0) {
        if (!empty) {
          empty = document.createElement("div");
          empty.setAttribute("data-universal-search-empty", "true");
          empty.className =
            "mx-4 my-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs text-slate-500";

          empty.textContent =
            `No records found matching "${activeQuery}".`;

          const firstNode = nodes[0];
          firstNode.parentElement?.parentElement?.insertBefore(
            empty,
            firstNode.parentElement
          );
        } else {
          empty.textContent =
            `No records found matching "${activeQuery}".`;
          empty.style.display = "";
        }
      } else if (empty) {
        empty.style.display = "none";
      }
    };

    filter();

    const observer = new MutationObserver(() => {
      filter();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("page-search-change", filter);
    window.addEventListener("popstate", filter);

    return () => {
      observer.disconnect();
      window.removeEventListener("page-search-change", filter);
      window.removeEventListener("popstate", filter);

      root
        .querySelectorAll<HTMLElement>(
          "[data-universal-search-empty]"
        )
        .forEach((node) => node.remove());

      root
        .querySelectorAll<HTMLElement>(selectors.join(","))
        .forEach((node) => {
          node.style.display = "";
        });
    };
  }, [query]);

  return null;
}

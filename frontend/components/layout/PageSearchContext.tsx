"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PageSearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
};

const PageSearchContext = createContext<PageSearchContextValue>({
  query: "",
  setQuery: () => {},
});

export function PageSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [query, setQueryState] = useState("");
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("q") || "";
      setQueryState(v);
      setInputValue(v);
    };

    read();

    window.addEventListener("popstate", read);
    window.addEventListener("hrms:page-search-change", read);

    return () => {
      window.removeEventListener("popstate", read);
      window.removeEventListener("hrms:page-search-change", read);
    };
  }, []);

  // Immediate: updates the input's displayed value (no lag while typing).
  // Debounced: only after typing pauses (~300ms) do we touch the URL,
  // dispatch the change event, and update `query` — this is what every
  // page's search-driven effects key off of, so they only re-run once
  // per pause instead of once per keystroke.
  const setQuery = (value: string) => {
    setInputValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQueryState(value);

      const params = new URLSearchParams(window.location.search);
      if (value.trim()) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      const queryString = params.toString();

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${queryString ? `?${queryString}` : ""}`
      );

      window.dispatchEvent(new Event("hrms:page-search-change"));
    }, 300);
  };

  const value = useMemo(
    () => ({
      query: inputValue,
      setQuery,
    }),
    [inputValue]
  );

  return (
    <PageSearchContext.Provider value={value}>
      {children}
    </PageSearchContext.Provider>
  );
}

export function usePageSearch() {
  return useContext(PageSearchContext);
}

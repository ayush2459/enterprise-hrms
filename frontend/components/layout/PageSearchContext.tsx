"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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

  useEffect(() => {
    const read = () => {
      const params = new URLSearchParams(window.location.search);
      setQueryState(params.get("q") || "");
    };

    read();

    window.addEventListener("popstate", read);
    window.addEventListener("hrms:page-search-change", read);

    return () => {
      window.removeEventListener("popstate", read);
      window.removeEventListener("hrms:page-search-change", read);
    };
  }, []);

  const setQuery = (value: string) => {
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
  };

  const value = useMemo(
    () => ({
      query,
      setQuery,
    }),
    [query]
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

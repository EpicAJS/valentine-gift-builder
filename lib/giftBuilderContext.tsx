"use client";

import { createContext, useContext } from "react";

interface GiftBuilderContextValue {
  slug: string | null;
}

const GiftBuilderContext = createContext<GiftBuilderContextValue>({
  slug: null
});

export function GiftBuilderProvider({
  slug,
  children
}: {
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <GiftBuilderContext.Provider value={{ slug }}>
      {children}
    </GiftBuilderContext.Provider>
  );
}

export function useGiftBuilder() {
  return useContext(GiftBuilderContext);
}


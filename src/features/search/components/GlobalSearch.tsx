"use client";

import { SearchCommandPalette } from "@/features/search/components/SearchCommandPalette";
import { SearchTrigger } from "@/features/search/components/SearchTrigger";
import { SearchProvider, useSearchPalette } from "@/features/search/search-context";

type GlobalSearchProps = {
  className?: string;
  compact?: boolean;
};

export function GlobalSearch({ className, compact }: GlobalSearchProps) {
  return <SearchTrigger className={className} compact={compact} />;
}

function SearchPaletteHost() {
  const { open, closeSearch } = useSearchPalette();
  return <SearchCommandPalette open={open} onClose={closeSearch} />;
}

export function StudentSearchShell({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      {children}
      <SearchPaletteHost />
    </SearchProvider>
  );
}

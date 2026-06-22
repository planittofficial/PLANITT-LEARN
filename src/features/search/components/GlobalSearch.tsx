"use client";

import { SearchCommandPalette } from "@/features/search/components/SearchCommandPalette";
import { SearchTrigger } from "@/features/search/components/SearchTrigger";
import { SearchProvider, useSearchPalette } from "@/features/search/search-context";

export function GlobalSearch({ className }: { className?: string }) {
  return <SearchTrigger className={className} />;
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

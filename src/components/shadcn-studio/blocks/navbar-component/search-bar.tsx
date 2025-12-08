import { Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { useState, useCallback, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
}

export function SearchBar({ className, isMobile = false }: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      router.navigate({
        to: "/search",
        search: { q: searchQuery.trim() },
      });

      // Clear input after search on mobile
      if (isMobile) {
        setSearchQuery("");
      }
    },
    [searchQuery, router, isMobile]
  );

  if (isMobile) {
    return (
      <form onSubmit={handleSearch} className={className}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-9 pr-4 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm">
            Rechercher
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`hidden md:flex items-center relative ${className || ""}`}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Recherche..."
        className="pl-9 pr-4 w-64"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </form>
  );
}

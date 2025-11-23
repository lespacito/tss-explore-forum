import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, User, Settings, LogOut } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { signOut } from "@/lib/auth-client";
import { useId, useState } from "react";

import { useSession } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const user = session?.user || null;
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const id = useId();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.navigate({
      to: "/search",
      search: { q: searchQuery.trim() },
    });
  }

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.invalidate();
          router.navigate({ to: "/" });
        },
      },
    });
  }

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Sidebar trigger for mobile */}
        <SidebarTrigger className="-ml-1" />

        {/* Logo/Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
        >
          <span className="hidden sm:inline">TSS Explore Forum</span>
          <span className="sm:hidden">TEF</span>
        </Link>

        {/* Search bar - desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Recherche directe..."
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* Search icon - mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => {
            const input = document.getElementById("mobile-search");
            input?.focus();
          }}
        >
          <Search className="h-5 w-5" />
        </Button>
        {/* User menu or sign in */}
        {isPending ? (
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
            <div className="hidden sm:block h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 gap-2 rounded-full pl-2 pr-3 hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name} />
                  )}
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">
                  {user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/account/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth/login">Se connecter</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/auth/login">Commencer</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile search bar */}
      <div className="border-t px-4 py-2 md:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={id}
              type="search"
              placeholder="Rechercher..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>
    </header>
  );
}

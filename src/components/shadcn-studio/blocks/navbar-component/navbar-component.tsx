import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import Logo from "@/components/shadcn-studio/logo";
import ToggleTheme from "@/components/shadcn-studio/switch/toggle-theme";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { mainNavLinks } from "@/data/navigation";
import { SearchBar } from "./search-bar";
import { UserProfileMenu } from "./user-profile-menu";
import { MobileMenu } from "./mobile-menu";
import { AuthButtons } from "./auth-buttons";
import { UserSkeleton } from "./user-skeleton";

const routeApi = getRouteApi("__root__");

/**
 * Main navigation bar component
 * Features:
 * - Responsive design with mobile menu
 * - User authentication state
 * - Theme toggle
 * - Search functionality
 * - Desktop and mobile layouts
 */
const Navbar = () => {
  const { authSession } = routeApi.useLoaderData();
  const user = authSession?.user;
  const routerState = useRouterState();
  const isPending = routerState.isLoading;

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-7 sm:px-6">
        {/* Left side - Logo and navigation links */}
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <nav className="text-muted-foreground flex flex-1 items-center gap-8 font-medium md:justify-center lg:gap-16">
            <Link to="/" className="flex items-center">
              <Logo />
              <span className="sr-only">Page d'accueil</span>
            </Link>
            {mainNavLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="hover:text-primary max-md:hidden whitespace-nowrap transition-colors"
                activeProps={{
                  className: "text-primary",
                }}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side - Search, Theme, Menu, Auth */}
        <div className="flex items-center gap-4">
          {/* Desktop search */}
          <SearchBar />

          {/* Theme toggle */}
          <ToggleTheme />

          {/* Mobile menu with search */}
          <MobileMenu />

          {/* User profile or auth buttons */}
          {isPending ? (
            <UserSkeleton />
          ) : user ? (
            <UserProfileMenu user={user} />
          ) : (
            <AuthButtons />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

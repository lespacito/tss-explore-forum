import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import Logo from "@/components/shadcn-studio/logo";
import ToggleTheme from "@/components/shadcn-studio/switch/toggle-theme";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { mainNavLinks } from "@/data/navigation";
import { AuthButtons } from "./auth-buttons";
import { MobileMenu } from "./mobile-menu";

import { UserProfileMenu } from "./user-profile-menu";
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
	const loaderData = routeApi.useLoaderData();
	const authSession = loaderData?.authSession;
	const user = authSession?.user;
	const routerState = useRouterState();
	const isPending = routerState.isLoading;
	const isLanding = routerState.location.pathname === "/";

	if (isLanding) {
		return (
			<header className="landing-nav">
				<div>
					<Link to="/" className="landing-nav-brand">
						Parlons Violence
					</Link>
					<span className="landing-nav-beta">BÊTA PRIVÉE · SUISSE ROMANDE</span>
					<nav aria-label="Navigation de la page d’accueil">
						<a href="#main-content">Le projet</a>
						<a href="#comment-ca-marche">Comment ça marche</a>
						<a href="#questions">Vos questions</a>
						<Link to="/help">Nous contacter</Link>
					</nav>
					{user ? (
						<UserProfileMenu user={user} />
					) : (
						<Link to="/auth/anonymous-signin" className="landing-session-link">
							<KeyRound aria-hidden="true" /> Retrouver ma session
						</Link>
					)}
				</div>
				{loaderData?.beta?.submissionsOpen === false && (
					<output className="landing-beta-status">
						Dépôts suspendus · {loaderData.beta.moderationSchedule}
					</output>
				)}
			</header>
		);
	}

	return (
		<header className="sticky top-0 z-50 border-b bg-background">
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
				{/* Left side - Logo and navigation links */}
				<div className="flex min-w-0 items-center gap-2">
					<SidebarTrigger />
					<nav className="flex flex-1 items-center gap-5 font-medium text-muted-foreground">
						<Link to="/" className="flex items-center">
							<Logo />
							<span className="sr-only">Page d'accueil</span>
						</Link>
						{mainNavLinks.map((item) => (
							<Link
								key={item.href}
								to={item.href}
								className="max-xl:hidden whitespace-nowrap transition-colors hover:text-primary"
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
				<div className="flex min-w-0 items-center gap-2">
					{/* Desktop search */}

					{/* Theme toggle */}
					<div className="hidden sm:flex">
						<ToggleTheme />
					</div>

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
			<div className="border-t px-4 py-2 text-sm leading-6 text-muted-foreground">
				<p className="mx-auto max-w-7xl">
					{loaderData?.beta?.submissionsOpen
						? "Dépôts ouverts · "
						: "Dépôts suspendus · "}
					{loaderData?.beta?.moderationSchedule}
				</p>
			</div>
		</header>
	);
};

export default Navbar;

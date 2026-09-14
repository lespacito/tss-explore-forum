import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CircleHelp, KeyRound, Menu, Shield } from "lucide-react";
import ToggleTheme from "@/components/shadcn-studio/switch/toggle-theme";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthButtons } from "./auth-buttons";
import { UserProfileMenu } from "./user-profile-menu";
import { UserSkeleton } from "./user-skeleton";

const routeApi = getRouteApi("__root__");

const Navbar = () => {
	const loaderData = routeApi.useLoaderData();
	const user = loaderData?.authSession?.user;
	const routerState = useRouterState();
	const scenariosActive =
		routerState.location.pathname.startsWith("/account/profile");

	return (
		<header className="civic-nav">
			<div className="civic-nav__inner">
				<div className="civic-nav__primary">
					<Link
						to="/"
						className="civic-wordmark"
						aria-label="Parlons Violence, accueil"
					>
						<span>Parlons</span> Violence
					</Link>
					<span className="civic-beta-mark">Bêta privée</span>
					{user && (
						<Link
							to="/account/profile"
							className="civic-scenarios-link"
							aria-current={scenariosActive ? "page" : undefined}
						>
							Mes scénarios
						</Link>
					)}
				</div>

				<div className="civic-nav__actions">
					<div className="hidden sm:flex">
						<ToggleTheme />
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="min-h-11 gap-2">
								<Menu aria-hidden="true" className="size-4" />
								<span className="hidden md:inline">Informations</span>
								<span className="sr-only md:hidden">
									Ouvrir les informations
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-64">
							<DropdownMenuLabel>La bêta privée</DropdownMenuLabel>
							<DropdownMenuItem asChild>
								<Link to="/threads">
									<BookOpen /> Scénarios publics
								</Link>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link to="/rules">
									<BookOpen /> Règles
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/privacy">
									<Shield /> Confidentialité
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/help">
									<CircleHelp /> Aide et contact
								</Link>
							</DropdownMenuItem>
							{!user && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<Link to="/auth/anonymous-signin">
											<KeyRound /> Retrouver ma session
										</Link>
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
					{routerState.isLoading ? (
						<UserSkeleton />
					) : user ? (
						<UserProfileMenu user={user} />
					) : (
						<AuthButtons />
					)}
				</div>
			</div>
			<div className="civic-service-status">
				<p>
					{loaderData?.beta?.submissionsOpen
						? "Envoi de scénarios ouvert · "
						: "Envoi de scénarios suspendu · "}
					{loaderData?.beta?.moderationSchedule}
				</p>
			</div>
		</header>
	);
};

export default Navbar;

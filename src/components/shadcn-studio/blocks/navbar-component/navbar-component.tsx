import { getRouteApi, Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, CircleHelp, KeyRound, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { AuthButtons } from "./auth-buttons";
import { NavbarThemeControl } from "./navbar-theme-control";
import { UserProfileMenu, UserProfileMenuItems } from "./user-profile-menu";
import { UserSkeleton } from "./user-skeleton";

const routeApi = getRouteApi("__root__");

const Navbar = () => {
	const { accessRequired } = useBetaPresentation();
	const loaderData = routeApi.useLoaderData();
	const user = loaderData?.authSession?.user;
	const routerState = useRouterState();
	const spaceActive =
		routerState.location.pathname.startsWith("/account/profile");
	return (
		<header className="civic-nav">
			<nav className="civic-nav__inner" aria-label="Navigation principale">
				<div className="civic-nav__primary">
					<Link
						to="/"
						className="civic-wordmark"
						aria-label="Parlons Violence, accueil"
					>
						<span>Parlons</span> Violence
					</Link>
					<span className="civic-beta-mark civic-nav__desktop-only">
						{accessRequired ? "Bêta privée" : "Accès public"}
					</span>
					{user && (
						<Link
							to="/account/profile"
							className="civic-scenarios-link civic-nav__desktop-only"
							aria-current={spaceActive ? "page" : undefined}
						>
							Mes situations fictives
						</Link>
					)}
				</div>
				<div className="civic-nav__actions">
					<Link to="/help" className="civic-nav__help">
						<CircleHelp aria-hidden="true" className="size-4" /> Aide
					</Link>
					<div className="civic-nav__secondary">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="civic-nav__control"
									aria-label="Menu de navigation — Informations"
								>
									<Menu aria-hidden="true" className="size-4" />
									<span className="civic-nav__compact-only">Menu</span>
									<span className="civic-nav__desktop-only">Informations</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="civic-nav-menu">
								<DropdownMenuLabel>Navigation</DropdownMenuLabel>
								<DropdownMenuItem asChild>
									<Link to="/threads">
										<BookOpen /> Situations fictives publiées
									</Link>
								</DropdownMenuItem>
								{user && (
									<DropdownMenuItem asChild className="civic-nav__compact-only">
										<Link
											to="/account/profile"
											aria-current={spaceActive ? "page" : undefined}
										>
											<BookOpen /> Mes situations fictives
										</Link>
									</DropdownMenuItem>
								)}
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Informations</DropdownMenuLabel>
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
								<DropdownMenuGroup className="civic-nav__compact-only">
									<DropdownMenuSeparator />
									<DropdownMenuLabel>Préférences</DropdownMenuLabel>
									<NavbarThemeControl inMenu />
									<DropdownMenuSeparator />
									<DropdownMenuLabel>Compte et session</DropdownMenuLabel>
									{routerState.isLoading ? (
										<output className="block px-2 py-3 text-sm">
											Chargement de la session…
										</output>
									) : user ? (
										<UserProfileMenuItems user={user} />
									) : (
										<DropdownMenuItem asChild>
											<Link to="/auth/anonymous-signin">
												<KeyRound /> Retrouver ma session
											</Link>
										</DropdownMenuItem>
									)}
								</DropdownMenuGroup>
								{!user && (
									<DropdownMenuItem asChild className="civic-nav__desktop-only">
										<Link to="/auth/anonymous-signin">
											<KeyRound /> Retrouver ma session
										</Link>
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
						<div className="civic-nav__desktop-only">
							<NavbarThemeControl />
						</div>
						<div className="civic-nav__desktop-only">
							{routerState.isLoading ? (
								<UserSkeleton />
							) : user ? (
								<UserProfileMenu user={user} />
							) : (
								<AuthButtons />
							)}
						</div>
					</div>
				</div>
			</nav>
			<div className="civic-service-status">
				<p>
					{loaderData?.beta?.submissionsOpen
						? "Envoi de situations fictives ouvert · "
						: "Envoi de situations fictives suspendu · "}
					{loaderData?.beta?.moderationSchedule}
				</p>
			</div>
		</header>
	);
};
export default Navbar;

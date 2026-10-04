import { Link } from "@tanstack/react-router";
import { LogOut, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/lib/auth-client";
import type { getAuthSession } from "@/features/auth/server/get-auth-session";

interface UserProfileMenuProps {
	user: NonNullable<Awaited<ReturnType<typeof getAuthSession>>["user"]>;
}

// Share the existing actions between desktop and the flat compact menu.
export function UserProfileMenuItems({ user }: UserProfileMenuProps) {
	const handleSignOut = useCallback(async () => {
		await signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.assign("/beta?leave=1");
				},
			},
		});
	}, []);

	return (
		<>
			<DropdownMenuLabel>
				<div className="flex flex-col space-y-1">
					<p className="text-sm font-medium leading-none">
						{user.displayUsername}
					</p>
					{user.username && (
						<p className="text-xs leading-none text-muted-foreground">
							@{user.username}
						</p>
					)}
					<p className="text-xs leading-none text-muted-foreground">
						{user.isAnonymous ? "Session anonyme" : user.email}
					</p>
				</div>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />

			<DropdownMenuItem asChild>
				<Link to="/account/settings" className="cursor-pointer">
					<Settings className="mr-2 h-4 w-4" />
					<span>Paramètres</span>
				</Link>
			</DropdownMenuItem>
			{["ADMIN", "MODERATOR"].includes(user.role) && (
				<DropdownMenuItem asChild>
					<Link to="/admin/moderation" className="cursor-pointer">
						<ShieldCheck className="mr-2 h-4 w-4" />
						<span>Modération</span>
					</Link>
				</DropdownMenuItem>
			)}
			<DropdownMenuSeparator />
			<DropdownMenuItem
				onClick={handleSignOut}
				className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
			>
				<LogOut className="mr-2 h-4 w-4" />
				<span>Déconnexion</span>
			</DropdownMenuItem>
		</>
	);
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					aria-label="Mon compte"
					className="civic-nav__control"
				>
					<UserRound aria-hidden="true" /> <span>Mon compte</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="civic-nav-menu">
				<UserProfileMenuItems user={user} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

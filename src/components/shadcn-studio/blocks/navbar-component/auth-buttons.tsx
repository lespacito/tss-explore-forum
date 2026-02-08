import { Link } from "@tanstack/react-router";
import { ChevronDown, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthButtons() {
	return (
		<div className="flex items-center gap-2">
			{/* Dropdown pour choisir le type de connexion */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="gap-1">
						Se connecter
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuItem asChild>
						<Link
							to="/auth/login"
							className="flex items-center gap-2 cursor-pointer"
						>
							<Mail className="h-4 w-4" />
							<span>Avec email</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link
							to="/auth/anonymous-signin"
							className="flex items-center gap-2 cursor-pointer"
						>
							<KeyRound className="h-4 w-4" />
							<span>Avec code secret</span>
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Bouton Commencer (inscription) */}
			<Button asChild size="sm" className="hidden sm:inline-flex">
				<Link to="/auth/login">Commencer</Link>
			</Button>
		</div>
	);
}

import { Link } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mainNavLinks } from "@/data/navigation";


export function MobileMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="xl:hidden" asChild>
				<Button variant="outline" size="icon">
					<MenuIcon className="h-4 w-4" />
					<span className="sr-only">Ouvrir le menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-72" align="end">
				<DropdownMenuGroup>
					{mainNavLinks.map((item) => (
						<DropdownMenuItem key={item.href} asChild>
							<Link to={item.href} className="cursor-pointer">
								{item.title}
							</Link>
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

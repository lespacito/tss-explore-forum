import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { useIsClient } from "@/hooks/use-is-client";

export function NavbarThemeControl({ inMenu = false }: { inMenu?: boolean }) {
	const { resolvedTheme, setTheme } = useTheme();
	const isClient = useIsClient();
	if (!isClient) return null;
	const checked = resolvedTheme === "dark";
	const setChecked = (value: boolean) => setTheme(value ? "dark" : "light");
	if (inMenu) {
		return (
			<DropdownMenuCheckboxItem
				checked={checked}
				onCheckedChange={setChecked}
				onSelect={(event) => event.preventDefault()}
			>
				Thème sombre
			</DropdownMenuCheckboxItem>
		);
	}
	return (
		<Button
			variant="ghost"
			className="civic-nav__control"
			role="switch"
			aria-label="Thème sombre"
			aria-checked={checked}
			onClick={() => setChecked(!checked)}
		>
			{checked ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
			<span>Thème</span>
		</Button>
	);
}

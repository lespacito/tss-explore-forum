import LogoSvg from "@/assets/svg/logo";

// Util Imports
import { cn } from "@/lib/utils";

const Logo = ({ className }: { className?: string }) => {
	return (
		<div className={cn("flex items-center gap-2.5", className)}>
			<LogoSvg className="hidden size-8 shrink-0 sm:block" />
			<span className="text-base font-semibold sm:text-xl">Parlons violence</span>
		</div>
	);
};

export default Logo;

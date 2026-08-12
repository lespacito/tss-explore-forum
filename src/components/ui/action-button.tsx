import type { VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface props
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	children: React.ReactNode;
	isPending: boolean;
	onClick?: () => void;
	requireAreYouSure?: boolean;
}

/**
 * Renders a button with optional loading and confirmation states.
 *
 * @param isPending - Displays a loading indicator and disables the button while true.
 * @param requireAreYouSure - Requires confirmation before invoking `onClick`.
 * @returns The rendered button, optionally wrapped in a confirmation dialog.
 */
export default function ActionButton({
	children,
	isPending,
	variant,
	size,
	className,
	onClick,
	requireAreYouSure,
	disabled,
	type = "submit",
	...buttonProps
}: props) {
	const button = (
		<Button
			onClick={
				requireAreYouSure
					? undefined
					: onClick
						? (e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								onClick();
							}
						: undefined
			}
			type={type}
			disabled={disabled || isPending}
			variant={variant}
			size={size}
			className={cn(
				className,
				"inline-grid place-items-center [grid-template-areas:'stack']",
			)}
			{...buttonProps}
		>
			<span
				className={cn(
					isPending && "invisible",
					"flex items-center gap-2 [grid-area:stack]",
				)}
			>
				{children}
			</span>
			<LoaderCircle
				aria-label="Submitting"
				className={cn(
					isPending ? "visible" : "invisible",
					"size-5 animate-spin transition-opacity [grid-area:stack]",
				)}
			/>
		</Button>
	);

	if (requireAreYouSure) {
		return (
			<AlertDialog>
				<AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette action est irréversible.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction
							className={cn(buttonVariants({ variant }))}
							onClick={
								onClick
									? (e) => {
											e.preventDefault();
											onClick();
										}
									: undefined
							}
						>
							Continuer
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	return button;
}

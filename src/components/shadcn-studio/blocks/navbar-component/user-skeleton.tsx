export function UserSkeleton() {
	return (
		<div className="flex items-center gap-2">
			<div className="h-10 w-10 rounded-full bg-muted motion-safe:animate-pulse" />
			<div className="hidden h-4 w-24 rounded bg-muted motion-safe:animate-pulse sm:block" />
		</div>
	);
}

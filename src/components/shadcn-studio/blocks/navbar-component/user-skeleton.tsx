export function UserSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
      <div className="hidden sm:block h-4 w-24 bg-muted animate-pulse rounded" />
    </div>
  );
}

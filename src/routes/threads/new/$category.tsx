import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/threads/new/$category")({
	beforeLoad: () => {
		throw redirect({ to: "/threads/new" });
	},
});

import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { AppSidebar } from "@/components/header/sidebar";
import Navbar from "@/components/shadcn-studio/blocks/navbar-component/navbar-component";
import ThemeProvider from "@/components/theme";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Parlons Violence — Forum de soutien anonyme",
			},
			{
				name: "description",
				content:
					"Parlons Violence est un forum de soutien anonyme pour partager des expériences de violence, d'abus et de détresse. Espace bienveillant, confidentiel, sans inscription obligatoire.",
			},
			{ property: "og:site_name", content: "Parlons Violence" },
			{ property: "og:locale", content: "fr_CH" },
			{ property: "og:type", content: "website" },
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "manifest",
				href: "/manifest.json",
			},
		],
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: "Parlons Violence",
					url: "https://parlonsviolence.ch",
					description:
						"Forum de soutien anonyme pour les victimes de violence, d'abus et de détresse.",
					inLanguage: "fr-CH",
				}),
			},
		],
	}),

	loader: async () => {
		const data = await getAuthSessionCached();
		return {
			authSession: data,
		};
	},
	shellComponent: RootDocument,
	notFoundComponent: () => (
		<div className="flex flex-col items-center justify-center h-screen text-center">
			<h1 className="text-4xl font-bold mb-2">404</h1>
			<p className="text-foreground">La page que tu cherches n’existe pas 🫥</p>
		</div>
	),
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body
				className="min-h-screen antialiased font-sans"
				suppressHydrationWarning
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					themes={["light", "dark"]}
					storageKey="tss-explore-theme"
					disableTransitionOnChange
				>
					<SidebarProvider>
						<div className="flex min-h-screen w-full">
							<AppSidebar />
							<div className="flex flex-1 flex-col">
								<Navbar />
								<main>{children}</main>
							</div>
						</div>
						<Toaster position="top-right" />
						{/*
              OPTIMIZATION: Devtools are only included in development builds.
              Modern bundlers with dead code elimination will remove this entire block
              in production when NODE_ENV !== 'development', saving ~200-300KB.
            */}
						{process.env.NODE_ENV === "development" && (
							<TanStackDevtools
								config={{
									position: "bottom-right",
								}}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
									TanStackQueryDevtools,
								]}
							/>
						)}
					</SidebarProvider>
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}

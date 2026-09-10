import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getBetaSettings } from "@/features/beta/server/settings";
import { AppSidebar } from "@/components/header/sidebar";
import { PublicationReceiptProvider } from "@/features/beta/components/publication-receipt";
import Footer from "@/components/shadcn-studio/blocks/footer";
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
		meta: [{ name: "robots", content: "noindex, nofollow" }, { name: "referrer", content: "no-referrer" },
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Parlons Violence — Bêta privée",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	loader: async () => {
		const [data, beta] = await Promise.all([getAuthSessionCached(), getBetaSettings()]);
		return {
			authSession: data,
 beta,
		};
	},
	shellComponent: RootDocument,
	errorComponent: () => <div role="alert" className="mx-auto max-w-xl space-y-4 px-4 py-12"><h1 className="font-serif text-2xl">Cette page n’a pas pu être chargée</h1><p>Votre action n’a pas été confirmée. Rechargez la page pour réessayer.</p><a href="/" className="underline">Retour à l’accueil</a></div>,
	notFoundComponent: () => (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
			<h1 className="text-4xl font-bold">Page introuvable</h1>
			<p className="text-foreground">
				La page que vous cherchez n’existe pas ou a été déplacée.
			</p>
			<a className="underline underline-offset-4" href="/">
				Retour à l’accueil
			</a>
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
				<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:p-3">Aller au contenu</a>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					themes={["light", "dark"]}
					storageKey="tss-explore-theme"
					disableTransitionOnChange
				>
					<PublicationReceiptProvider><SidebarProvider defaultOpen={false}>
						<div className="flex min-h-screen w-full">
							<AppSidebar />
							<div className="flex min-w-0 flex-1 flex-col">
								<Navbar />
								<main id="main-content" className="min-w-0 flex-1">{children}</main><Footer />
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
					</SidebarProvider></PublicationReceiptProvider>
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}

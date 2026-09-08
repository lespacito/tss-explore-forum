import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getAuthSessionCached } from "@/features/auth/server/get-auth-session";
import { EraseAccountForm } from "@/features/beta/components/erase-account-form";
export const Route = createFileRoute("/account/settings/")({ component: Settings, loader: async () => { const session = await getAuthSessionCached(); if (!session.user) throw redirect({to: "/auth/anonymous-signin"}); return { user: session.user }; } });
function Settings() { const {user} = Route.useLoaderData(); return <div className="mx-auto max-w-2xl space-y-8 px-4 py-10"><Link to="/account/profile" className="underline">Retour à mes publications</Link><h1 className="font-serif text-3xl font-semibold">Gérer mon compte</h1><p>Conservez votre code secret avant de quitter votre session. Ne le communiquez pas à l’organisateur.</p><section className="border-t pt-8"><EraseAccountForm anonymous={user.isAnonymous}/></section></div>; }

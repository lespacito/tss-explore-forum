import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignInTab } from "@/features/auth/components/sign-in-tab";
import { SignUpTab } from "@/features/auth/components/sign-up-tab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth/login/")({
  component: RouteComponent,
  loader: async () => {
    const session = await getAuthSession();
    if (session?.user) {
      throw redirect({
        to: "/",
      });
    }
  },
});

function RouteComponent() {
  return (
    <Tabs defaultValue="sign-up" className="w-full max-w-md mx-auto my-6 px-4">
      <TabsList>
        <TabsTrigger value="sign-in">Se connecter</TabsTrigger>
        <TabsTrigger value="sign-up">S'inscrire</TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Se connecter</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInTab />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sign-up">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>S'inscrire</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpTab />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

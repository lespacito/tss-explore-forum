import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInTab } from "@/features/auth/components/sign-in-tab";
import { SignUpTab } from "@/features/auth/components/sign-up-tab";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { useState } from "react";
import { EmailVerification } from "@/features/auth/components/email-verification";
import { ForgotPassword } from "@/features/auth/components/forgot-password";

export const Route = createFileRoute("/auth/login/")({
  component: RouteComponent,
  loader: async () => {
    const session = await getAuthSession();
    if (session?.user) {
      throw redirect({
        to: "/",
      });
    }
    // Retourner authSession pour que le Navbar puisse y accéder
    return {
      authSession: session,
    };
  },
});

type Tab = "sign-in" | "sign-up" | "email-verification" | "forget-password";

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [selectedTab, setSelectedTab] = useState<Tab>("sign-in");

  function openEmailVerificationTab(email: string) {
    setEmail(email);
    setSelectedTab("email-verification");
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(t) => setSelectedTab(t as Tab)}
      className="w-full mx-auto max-w-2xl my-6 px-4"
    >
      {(selectedTab === "sign-in" || selectedTab === "sign-up") && (
        <TabsList>
          <TabsTrigger value="sign-in">Se connecter</TabsTrigger>
          <TabsTrigger value="sign-up">S'inscrire</TabsTrigger>
        </TabsList>
      )}
      <TabsContent value="sign-in">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Se connecter</CardTitle>
          </CardHeader>
          <CardContent>
            <SignInTab
              openEmailVerificationTab={openEmailVerificationTab}
              openForgotPassword={() => setSelectedTab("forget-password")}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="sign-up">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>S'inscrire</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpTab openEmailVerificationTab={openEmailVerificationTab} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="email-verification">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Vérifier votre email</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailVerification email={email} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="forget-password">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Mot de passe oublié</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPassword openSignInTab={() => setSelectedTab("sign-in")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

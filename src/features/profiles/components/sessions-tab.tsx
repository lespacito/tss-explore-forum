import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionManagement } from "./session-management";

export const SessionsTab = ({
  sessions,
  currentSessionToken,
}: {
  sessions: any;
  currentSessionToken: string;
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Sessions</CardTitle>
        <CardDescription>Gérez vos sessions actives.</CardDescription>
      </CardHeader>
      <CardContent>
        <SessionManagement
          sessions={sessions}
          currentSessionToken={currentSessionToken}
        />
      </CardContent>
    </Card>
  );
};

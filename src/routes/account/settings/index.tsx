import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Paramètres</h1>
      <p>Contenu des paramètres...</p>
    </div>
  );
}

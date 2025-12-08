import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useId } from "react";
import { useIsClient } from "@/hooks/use-is-client";

const ToggleTheme = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();
  const id = useId();

  // Empêche le rendu du switch avant le montage client
  if (!isClient) return null;

  const checked = resolvedTheme === "dark";

  return (
    <div className="inline-flex items-center gap-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
        aria-label="Toggle theme"
      />
      <Label htmlFor={id}>
        <span className="sr-only">Toggle theme</span>
        {checked ? (
          <MoonIcon className="size-4" aria-hidden="true" />
        ) : (
          <SunIcon className="size-4" aria-hidden="true" />
        )}
      </Label>
    </div>
  );
};

export default ToggleTheme;

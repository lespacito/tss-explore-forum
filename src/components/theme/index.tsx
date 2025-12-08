import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * ThemeProvider for TanStack Start RC 2025
 * - Uses next-themes under the hood with sensible defaults for SSR and Tailwind v4
 * - Applies the theme via `class` attribute (supports `.dark` variant)
 * - Persists user preference in localStorage under `tss-explore-theme`
 *
 * You can override any prop via the component usage if needed.
 */
export function ThemeProvider({
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  enableColorScheme = true,
  themes = ["light", "dark"],
  storageKey = "tss-explore-theme",
  disableTransitionOnChange = false,
  nonce,
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      enableColorScheme={enableColorScheme}
      themes={themes}
      storageKey={storageKey}
      disableTransitionOnChange={disableTransitionOnChange}
      nonce={nonce}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useNextTheme();

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
export default ThemeProvider;

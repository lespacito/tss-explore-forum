/**
 * Navigation configuration
 * Centralizes all navigation links used across the application
 */

export type NavigationLink = {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * Main navigation links displayed in the navbar
 */
export const mainNavLinks: NavigationLink[] = [
  { title: "Discussions", href: "/threads" },
  { title: "Règles", href: "/rules" },
  { title: "FAQ", href: "/faq" },
  { title: "Conseils de Sécurité", href: "/safety" },
  { title: "Contact", href: "/contact" },
];

/**
 * User account navigation links
 */
export const accountNavLinks: NavigationLink[] = [
  { title: "Profil", href: "/account/profile" },
  { title: "Paramètres", href: "/account/settings" },
];

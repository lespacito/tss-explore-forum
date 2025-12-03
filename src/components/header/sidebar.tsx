import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  SquareFunction,
  Network,
  StickyNote,
  Phone,
  Heart,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
const menuItems = [
  {
    title: "Discussions générales",
    url: "/demo/start/server-funcs",
    icon: SquareFunction,
  },
  {
    title: "Conseils",
    url: "/demo/start/api-request",
    icon: Network,
  },
  {
    title: "Témoignages",
    url: "/demo/start/ssr",
    icon: StickyNote,
  },
  {
    title: "Ressources",
    url: "/demo/tanstack-query",
    icon: Network,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Catégories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Soutien & Urgence</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                {
                  title: "Urgence",
                  url: "/emergency",
                  icon: Phone,
                },
                {
                  title: "Santé Mentale",
                  url: "/mental-health",
                  icon: Heart,
                },
                {
                  title: "Violences",
                  url: "/violence-help",
                  icon: ShieldAlert,
                },
                {
                  title: "Signaler un abus",
                  url: "/report",
                  icon: AlertCircle,
                },
              ].map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

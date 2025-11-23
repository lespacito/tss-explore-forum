import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Home,
  SquareFunction,
  Network,
  StickyNote,
  Database,
  ClipboardType,
  ChevronRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Accueil",
    url: "/",
    icon: Home,
  },
  {
    title: "Server Functions",
    url: "/demo/start/server-funcs",
    icon: SquareFunction,
  },
  {
    title: "API Request",
    url: "/demo/start/api-request",
    icon: Network,
  },
  {
    title: "SSR Demos",
    url: "/demo/start/ssr",
    icon: StickyNote,
    items: [
      {
        title: "SPA Mode",
        url: "/demo/start/ssr/spa-mode",
      },
      {
        title: "Full SSR",
        url: "/demo/start/ssr/full-ssr",
      },
      {
        title: "Data Only",
        url: "/demo/start/ssr/data-only",
      },
    ],
  },
  {
    title: "Drizzle",
    url: "/demo/drizzle",
    icon: Database,
  },
  {
    title: "Formulaires",
    url: "/demo/form/simple",
    icon: ClipboardType,
    items: [
      {
        title: "Form Simple",
        url: "/demo/form/simple",
      },
      {
        title: "Form Address",
        url: "/demo/form/address",
      },
    ],
  },
  {
    title: "TanStack Query",
    url: "/demo/tanstack-query",
    icon: Network,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <Link to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

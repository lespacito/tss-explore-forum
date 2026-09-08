import { Link } from "@tanstack/react-router";
import { FileText, KeyRound, LifeBuoy, Shield } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
const items = [
 { title: "Publications", url: "/threads", icon: FileText },
 { title: "Mes publications", url: "/account/profile", icon: FileText },
 { title: "Retrouver ma session", url: "/auth/anonymous-signin", icon: KeyRound },
 { title: "Confidentialité", url: "/privacy", icon: Shield },
 { title: "Aide et contact", url: "/help", icon: LifeBuoy },
];
export function AppSidebar() {
 return <Sidebar><SidebarContent><SidebarGroup><SidebarGroupLabel>Bêta privée</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{items.map(item => <SidebarMenuItem key={item.url}><SidebarMenuButton asChild className="min-h-11"><Link to={item.url}><item.icon aria-hidden="true"/><span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent></Sidebar>;
}

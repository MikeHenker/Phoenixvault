import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  MessageSquare,
  Mail,
  Settings,
} from "lucide-react";
import phoenixLogo from "@assets/a stylized phoenix m.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Games",
    url: "/admin/games",
    icon: Gamepad2,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Support Tickets",
    url: "/admin/support",
    icon: MessageSquare,
  },
  {
    title: "Game Requests",
    url: "/admin/requests",
    icon: Mail,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <img src={phoenixLogo} alt="Phoenix Games" className="h-8 w-8" />
          <div>
            <h2 className="font-display font-bold text-sm">PHOENIX GAMES</h2>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

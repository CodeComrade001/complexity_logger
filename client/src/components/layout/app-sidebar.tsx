import { Link, useLocation } from "wouter";
import { BarChart3, FolderGit2, Settings, FileText, LogOut, Activity, Key, BarChart3Icon, ActivityIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { title: "Overview", url: "/dashboard", icon: BarChart3 },
  { title: "Analysis", url: "//dashboard/complexity-full-result", icon: ActivityIcon },
  { title: "Projects", url: "/dashboard/projects", icon: FolderGit2 },
  { title: "Reports", url: "/dashboard/reports", icon: FileText },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  return (
    <Sidebar variant="inset" className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
      <div className="p-4 flex items-center gap-2 mb-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Activity className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">Complexity Zero</span>
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url} className="flex items-center gap-3 py-2.5 transition-all">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
        <SidebarMenuButton onClick={logout} className="w-full flex justify-start gap-3 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

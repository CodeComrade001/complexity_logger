import { ProtectedRoute } from "@/hooks/use-auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // <ProtectedRoute>
    <DashboardContent>{children}</DashboardContent>
    // </ProtectedRoute>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 hover:text-primary transition-colors" />
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-secondary/10 px-3 py-1.5 rounded-md border border-border/50">
                <Search className="w-4 h-4" />
                <span>Search projects (Cmd+K)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className=" bg-primary text-white hover:text-foreground"
              >
                {theme === "dark" ?
                  (
                    <Moon className="absolute  h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]  rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-100" />
                  )
                }
              </Button>

              <div className="h-6 w-px bg-border mx-1"></div>

              <Avatar className="h-8 w-8 border border-border hover:border-primary transition-colors cursor-pointer">
                <AvatarImage src="https://i.pravatar.cc/150?u=dev" />
                <AvatarFallback>DV</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 pb-4 p-4 md:p-8 bg-background">
            <div className="max-w-1xl mx-auto sm:overflow-auto pb-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import { Link, useLocation } from "react-router-dom";
import { Terminal, Github, Smartphone } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ThemeToggle";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");


  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {isDashboard && (
        <div className="md:hidden bg-background border-b border-border p-3 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
          <Smartphone className="h-3 w-3" />
          <span>Switch to desktop for full analysis tools</span>
        </div>
      )}

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-md border border-primary/20 group-hover:border-primary/50 transition-colors">
              <Terminal className="h-5 w-5 text-primary" />
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">
              COMPLEXITY<span className="text-primary">ZERO</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            {!isDashboard && (
              <>
                <a href="#features" className="btn-interactive hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="btn-interactive hover:text-foreground transition-colors">Methodology</a>
                <a href="#pricing" className="btn-interactive hover:text-foreground transition-colors">Pricing</a>
              </>
            )}
            {isDashboard && (
              <>
                <Link to="/dashboard"><a className={cn("btn-interactive hover:text-foreground transition-colors")}>Overview</a></Link>
                {/* <Link to="/dashboard"><a className={cn("hover:text-foreground transition-colors", location === "/dashboard" && "text-foreground")}>Overview</a></Link> */}
                <Link to="/dashboard/projects"><a className="btn-interactive hover:text-foreground transition-colors">Projects</a></Link>
                <Link to="/dashboard/settings"><a className="btn-interactive hover:text-foreground transition-colors">Settings</a></Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {!isDashboard ? (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-mono text-xs">Log In</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="font-mono text-xs gap-2">
                    <Github className="h-3 w-3" />
                    Start Analysis
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-mono font-bold text-primary">
                  JD
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {!isDashboard && (
        <footer className="border-t border-border py-12 bg-muted/20">
          <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <span className="font-mono font-bold text-muted-foreground">COMPLEXITY ZERO</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
                Static analysis platform for engineering teams.
                Detect complexity spikes before they merge.
              </p>
            </div>
            {/* Minimal footer links */}
          </div>
        </footer>
      )}
    </div>
  );
}
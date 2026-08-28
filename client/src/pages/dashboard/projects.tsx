import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Settings2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNotification } from "@/context/useNotification";

export default function Projects() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]); // Replace `any` with a proper Project type
  const { notify } = useNotification()

  const handleSync = () => {
    setIsLoading(true);
    notify("Fetching latest repositories from GitHub...", "info")
    // simulate fetching
    setTimeout(() => {
      setProjects([{ id: 1, name: "Demo Repo", language: "TypeScript", lastScan: "2 days ago", score: "A" }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Projects</h1>
            <p className="text-muted-foreground">
              Manage your connected repositories and analysis settings.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSync} className="bg-card">
              <RefreshCw className="w-4 h-4 mr-2" /> Sync Repos
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="p-6">
                  <Skeleton className="h-10 w-10 rounded-lg mb-2" />
                  <Skeleton className="h-6 w-24 rounded-md mb-2" />
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-9 w-full rounded-md" />
                </CardContent>
              </Card>
            ))
            : projects.map((p) => (
              <Card
                key={p.id}
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                      <CodeDot />
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${p.score.includes("A")
                        ? "bg-success/10 text-success border-success/20"
                        : p.score.includes("B")
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-warning/10 text-warning border-warning/20"
                        }`}
                    >
                      Score: {p.score}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <CodeDot className="w-3 h-3" /> {p.language}
                    </span>
                    <span>Updated {p.lastScan}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex-1 text-xs h-9 bg-secondary/10 text-secondary hover:bg-secondary/20"
                    >
                      View Report
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CodeDot(props?: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
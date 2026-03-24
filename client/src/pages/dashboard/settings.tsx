import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpdateSettings } from "@/hooks/use-dashboard";
import { useToast } from "@/hooks/use-toast";
import { Webhook, ShieldAlert } from "lucide-react";

export default function Settings() {
  const { mutate: saveSettings, isPending } = useUpdateSettings();
  const { toast } = useToast();

  const handleSave = () => {
    saveSettings({}, {
      onSuccess: () => {
        toast({
          title: "Settings Saved",
          description: "Your configuration has been successfully updated.",
        });
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground">Manage your account, integrations, and analysis thresholds.</p>
        </div>

        <div className="grid gap-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and contact info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="Developer User" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input defaultValue="dev@company.com" disabled className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 px-6 py-4">
              <Button onClick={handleSave} disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="w-5 h-5 text-warning" />
                <CardTitle>Analysis Thresholds</CardTitle>
              </div>
              <CardDescription>Configure when CI/CD pipelines should block PRs based on complexity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
                <div className="space-y-0.5">
                  <Label className="text-base">Fail on O(n²)</Label>
                  <p className="text-sm text-muted-foreground">Automatically block PRs containing nested loops scaling quadratically.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-3">
                <Label>Maximum Cyclomatic Complexity (Per Function)</Label>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="15" className="w-24 bg-background/50 text-center font-mono" />
                  <span className="text-sm text-muted-foreground">Standard recommendation is 10-15</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect Complexity Zero with your developer tooling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-card text-foreground border border-border">
                    <div className="w-6 h-6">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                      GitHub
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">GitHub App</p>
                    <p className="text-sm text-muted-foreground">Connected as @company-org</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/30 hover:text-destructive">Disconnect</Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded bg-secondary/10 text-secondary border border-secondary/20">
                    <Webhook className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Custom Webhooks</p>
                    <p className="text-sm text-muted-foreground">Send analysis payloads to your internal tools</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="bg-secondary/10 text-secondary hover:bg-secondary/20">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

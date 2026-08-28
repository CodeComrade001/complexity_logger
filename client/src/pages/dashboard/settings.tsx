import { JSX, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Webhook, ShieldAlert } from "lucide-react";
import { useNotification } from "@/context/useNotification";

export default function Settings() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { notify } = useNotification()
  const handleSave = () => {
    setIsSaving(true);
    notify("Your configuration has been successfully updated.", "success")
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, integrations, and analysis thresholds.
          </p>
        </div>

        {/* Profile Information */}
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
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>

        {/* Analysis Thresholds */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-warning" />
              <CardTitle>Analysis Thresholds</CardTitle>
            </div>
            <CardDescription>
              Configure when CI/CD pipelines should block PRs based on complexity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
              <div className="space-y-0.5">
                <Label className="text-base">Fail on O(n²)</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically block PRs containing nested loops scaling quadratically.
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-3">
              <Label>Maximum Cyclomatic Complexity (Per Function)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  defaultValue={15}
                  className="w-24 bg-background/50 text-center font-mono"
                />
                <span className="text-sm text-muted-foreground">Standard recommendation is 10-15</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect Complexity Zero with your developer tooling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntegrationRow
              icon={<GitHubIcon />}
              title="GitHub App"
              description="Connected as @company-org"
              buttonLabel="Disconnect"
              buttonVariant="destructive"
            />
            <IntegrationRow
              icon={<Webhook className="w-6 h-6" />}
              title="Custom Webhooks"
              description="Send analysis payloads to your internal tools"
              buttonLabel="Configure"
              buttonVariant="secondary"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function IntegrationRow({
  icon,
  title,
  description,
  buttonLabel,
  buttonVariant,
}: {
  icon: JSX.Element;
  title: string;
  description: string;
  buttonLabel: string;
  buttonVariant: "destructive" | "secondary";
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/30">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded bg-card text-foreground border border-border">{icon}</div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button variant={buttonVariant} size="sm">
        {buttonLabel}
      </Button>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 ..." />
    </svg>
  );
}
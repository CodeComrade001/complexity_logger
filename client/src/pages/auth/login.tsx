import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AxiosError } from "axios";
import { LOgInExistingAccount } from "@/utils/axios";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState(""); // optional for your API
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await LOgInExistingAccount({ phone, name });
      const { success, data } = response.data
      if (success) {
        console.log("user login successful", data)
      }
      // redirect or store token here
    } catch (err) {
      console.log("Turbo Log  ~ handleSubmit ~ err:", err);
      setError("Server Failure : Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    // Example: redirect to OAuth provider
    window.location.href = "/api/oauth/github/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <Navbar />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none opacity-50"></div>

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Complexity Zero</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Enter your credentials to access your dashboard</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-border/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08123456789"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/50 focus-visible:ring-primary h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 focus-visible:ring-primary h-11"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-border/60"></div>
            <span className="px-3 text-xs text-muted-foreground bg-card">Or continue with</span>
            <div className="flex-1 border-t border-border/60"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-6 h-11 bg-background/30 hover:bg-background/80 transition-colors"
            onClick={handleOAuthLogin}
          >
            {/* GitHub SVG */}
            <div className="w-4 h-4 mr-2 inline-block">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 ..." /></svg>
              GitHub
            </div>
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
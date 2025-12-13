import { useState } from "react";
import { Terminal, Github, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background font-sans text-foreground">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-center items-center p-8 border-r border-border relative">
        <div className="absolute top-8 left-8">
          <Link to="/">
            <a className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-md border border-primary/20 group-hover:border-primary/50 transition-colors">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <span className="font-mono font-bold text-lg tracking-tight">
                COMPLEXITY<span className="text-primary">ZERO</span>
              </span>
            </a>
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                required
                className="h-11 bg-muted/20 border-border focus:border-primary font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="h-11 bg-muted/20 border-border focus:border-primary font-mono text-sm"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="outline" type="button" className="w-full h-11 gap-2" onClick={handleLogin}>
            <Github className="h-4 w-4" />
            GitHub
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="text-primary hover:underline font-medium">
              Sign up for free
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-muted/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary-foreground)_0%,_transparent_50%)] opacity-20" />

        <div className="glass-panel max-w-lg w-full p-8 rounded-lg border border-border shadow-2xl relative z-10 rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-auto text-xs font-mono text-muted-foreground">analysis_result.json</span>
          </div>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complexity Score</span>
              <span className="text-red-500 font-bold">CRITICAL (92/100)</span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-[92%]" />
            </div>
            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">→</span>
                <span>Found 3 recursive loops</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">→</span>
                <span>Cognitive complexity {'>'} 15</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AxiosError } from "axios";
import { CreateNewAccount } from "@/utils/axios";
import { Navbar } from "@/components/layout/navbar";
import { Link } from "wouter";

export default function Signup() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await CreateNewAccount({ phone, name });
      const { success, data } = response.data
      if (success) {
        console.log("Account Creation successful", data)
      }
      console.log("Account created:", response.data);
      // redirect to login or dashboard
    } catch (err) {
      console.log("Turbo Log  ~ handleSubmit ~ err:", err);
      setError("Internal server error : Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = () => {
    window.location.href = "/api/oauth/github/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <Navbar />
      {/* <div className="absolute top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none opacity-50"></div> */}

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Complexity Zero</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Create an account</h1>
          <p className="text-muted-foreground text-sm">Start optimizing your codebase today</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-border/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ada Lovelace"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 focus-visible:ring-primary h-11"
              />
            </div>

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

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-border/60"></div>
            <span className="px-3 text-xs text-muted-foreground bg-card">Or sign up with</span>
            <div className="flex-1 border-t border-border/60"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-6 h-11 bg-background/30 hover:bg-background/80 transition-colors"
            onClick={handleOAuthSignup}
          >
            <div className="w-4 h-4 mr-2 inline-block">
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 ..." /></svg>
              GitHub
            </div>
          </Button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
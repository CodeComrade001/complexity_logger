import { ArrowRight, Activity, ShieldAlert, GitBranch, Github, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        {/* Accent Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 py-20 flex flex-col items-center text-center max-w-6xl mx-auto">

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-primary tracking-wider uppercase">
            Production Ready · v2.0
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <span className="block text-foreground/90">Stop Shipping</span>
          <span className="block bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent">
            Hidden Complexity
          </span>
        </h1>

        {/* Supporting Text */}
        <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground/90 max-w-3xl mb-4 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Compiler-backed static analysis that catches <span className="text-foreground font-medium">O(n²)</span> complexity
          before your users do.
        </p>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Built for engineering teams shipping at scale. Detect algorithmic risks, prevent tech debt,
          and maintain velocity—all before production.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
          <Link to="/login">
            <Button
              size="lg"
              className="group h-14 px-8 text-base font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 border-0"
            >
              Start Analyzing Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <Link to="/demo">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-base font-semibold rounded-md border-2 border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:border-primary/30 transition-all duration-300"
            >
              View Live Demo
            </Button>
          </Link>
        </div>

        {/* Social Proof / Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <a href="#" className="flex items-center gap-2 hover:text-foreground transition-colors group">
            <Github className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span>Open source on GitHub</span>
          </a>
          <span className="text-border">•</span>
          <a href="#" className="flex items-center gap-2 hover:text-foreground transition-colors group">
            <BookOpen className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span>Read the docs</span>
          </a>
          <span className="text-border">•</span>
          <span>Free for open source projects</span>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-600">
          <div className="group relative p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Cyclomatic Complexity</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AST-level parsing detects nested loops, conditional depth, and cognitive load in real-time.
              </p>
            </div>
          </div>

          <div className="group relative p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Smart Thresholds</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set complexity budgets per file or function. Block PRs that exceed your team's standards.
              </p>
            </div>
          </div>

          <div className="group relative p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">CI/CD Native</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Zero-config integration with GitHub Actions, GitLab CI, Jenkins, and CircleCI.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
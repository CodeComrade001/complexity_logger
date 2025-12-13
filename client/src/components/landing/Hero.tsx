import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Activity, ShieldAlert, GitBranch } from "lucide-react";
import heroBg from "@assets/generated_images/abstract_technical_wireframe_network_background.png";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-border">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Technical Background" 
          className="w-full h-full object-cover opacity-20 dark:opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_var(--background)_100%)]" />
      </div>

      <div className="container relative z-10 px-4 pt-20 pb-32 flex flex-col items-center text-center max-w-5xl mx-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-mono font-medium text-primary tracking-wide uppercase">
            v2.0 Now Available: Smart Thresholds
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          Stop Shipping <br />
          <span className="text-foreground">Hidden Complexity.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Visual static analysis for engineering teams. Detect O(n!) spikes, 
          prevent technical debt, and maintain velocity before production.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-base font-medium rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] border border-transparent">
              Analyze Your Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium rounded-sm border-border bg-background/50 backdrop-blur-sm hover:bg-muted/50">
            View Live Demo
          </Button>
        </div>

        {/* Tech Stats Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="glass-panel p-6 rounded-sm text-left relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Cyclomatic Complexity</h3>
            <p className="text-sm text-muted-foreground">Real-time AST parsing to detect nested loops and conditional depth.</p>
          </div>
          
          <div className="glass-panel p-6 rounded-sm text-left relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <ShieldAlert className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Risk Thresholds</h3>
            <p className="text-sm text-muted-foreground">Set hard limits on complexity per file. Block PRs that exceed budget.</p>
          </div>

          <div className="glass-panel p-6 rounded-sm text-left relative overflow-hidden group hover:border-primary/30 transition-colors">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <GitBranch className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">CI/CD Integration</h3>
            <p className="text-sm text-muted-foreground">Seamless integration with GitHub Actions, GitLab CI, and Bitbucket.</p>
          </div>
        </div>

      </div>
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
    </section>
  );
}
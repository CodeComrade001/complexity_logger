import { ArrowRight, CheckCircle2, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function FinalCTA() {
  const benefits = [
    "Free for open source projects",
    "No credit card required to start",
    "14-day trial for private repos",
    "Cancel anytime, keep your data"
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-gradient-to-br from-background via-primary/5 to-background border-t border-border overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          
          {/* Main Headline */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Start Analyzing <br />
              <span className="bg-gradient-to-br from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                in Under 60 Seconds
              </span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of engineering teams shipping cleaner, faster code. 
              No meetings, no sales calls—just install and run.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors"
              >
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground text-left">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <button className="group h-16 px-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            
            <a 
              href="https://github.com/your-org/complexity-analyzer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group h-16 px-10 rounded-lg border-2 border-border/50 bg-background/50 backdrop-blur-sm font-bold text-lg hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 flex items-center gap-3"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-border/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Active Repositories</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">5M+</div>
                <div className="text-sm text-muted-foreground">Files Analyzed Daily</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime SLA</div>
              </div>
            </div>
          </div>

          {/* Fine Print */}
          <p className="text-sm text-muted-foreground">
            Trusted by startups to Fortune 500s. SOC 2 Type II certified. GDPR compliant.
          </p>

        </div>
      </div>

      {/* Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
    </section>
  );
}

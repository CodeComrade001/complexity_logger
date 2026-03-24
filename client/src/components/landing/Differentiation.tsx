import { X, Check } from "lucide-react";

export function Differentiation() {
  const comparisons = [
    {
      feature: "Analysis Accuracy",
      others: "Regex-based pattern matching",
      ours: "Full AST traversal with type inference"
    },
    {
      feature: "Performance",
      others: "Re-analyze entire codebase every run",
      ours: "Incremental with dependency graph caching"
    },
    {
      feature: "Customization",
      others: "Fixed thresholds, one-size-fits-all",
      ours: "Per-language, per-directory custom limits"
    },
    {
      feature: "Integration",
      others: "Manual CLI runs, requires scripting",
      ours: "Zero-config CI/CD, GitHub App, IDE plugins"
    },
    {
      feature: "Context Awareness",
      others: "Treats all code equally",
      ours: "Framework-aware analysis (React, Django, etc.)"
    },
    {
      feature: "Reporting",
      others: "Text logs or static HTML dumps",
      ours: "Interactive dashboards with trend analysis"
    }
  ];

  const principles = [
    {
      title: "Research-Backed",
      description: "Built on McCabe, Halstead, and SonarSource's cognitive complexity research—not opinions."
    },
    {
      title: "Production-Proven",
      description: "Powers analysis for 10,000+ repositories. Battle-tested on codebases exceeding 5M LOC."
    },
    {
      title: "Developer-First",
      description: "Fast, accurate, actionable. No config sprawl. No cryptic errors. Just answers."
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-background border-b border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--primary)/0.05_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_var(--primary)/0.05_0%,_transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono font-semibold text-primary tracking-wider uppercase mb-6">
            Why We're Different
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Not Another Linter <br />
            <span className="text-primary">A Real Analysis Engine</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Most tools grep your code for patterns. We parse, analyze, and understand it—like a compiler does.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-muted/30 border-b border-border/50">
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Capability
              </div>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Other Tools
              </div>
              <div className="text-sm font-semibold text-primary uppercase tracking-wider text-center">
                Our Approach
              </div>
            </div>

            {/* Table Rows */}
            {comparisons.map((item, index) => (
              <div 
                key={index}
                className="grid grid-cols-3 gap-4 p-6 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="text-sm font-semibold text-foreground flex items-center">
                  {item.feature}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <X className="h-4 w-4 text-destructive flex-shrink-0" />
                  <span className="text-sm text-muted-foreground text-center">
                    {item.others}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground font-medium text-center">
                    {item.ours}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Principles */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Built on Three Core Principles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <div 
                key={index}
                className="relative p-8 rounded-lg border border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm"
              >
                {/* Number Badge */}
                <div className="absolute -top-3 left-6 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-lg shadow-primary/25">
                  {index + 1}
                </div>
                
                <h4 className="text-xl font-bold mb-3 text-foreground pt-2">
                  {principle.title}
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="mt-20 max-w-3xl mx-auto text-center">
          <blockquote className="text-lg md:text-xl italic text-muted-foreground border-l-4 border-primary pl-6 py-2">
            "The difference between a tool that checks syntax and one that understands 
            semantics is the difference between catching typos and preventing disasters."
          </blockquote>
          <div className="mt-4 text-sm text-muted-foreground">
            — Engineering teams using complexity analysis in production
          </div>
        </div>
      </div>
    </section>
  );
}

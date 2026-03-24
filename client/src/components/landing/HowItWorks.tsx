import { Terminal, BarChart3, Shield } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Terminal,
      title: "Install & Configure",
      description: "Add our CLI to your project or enable the GitHub App. Configure complexity thresholds in a single YAML file.",
      code: "npm install -g complexity-analyzer\ncomplexity init",
      highlight: "2-minute setup"
    },
    {
      number: "02",
      icon: BarChart3,
      title: "Analyze Your Codebase",
      description: "Run analysis locally or in CI. Get instant visual reports showing complexity hotspots, trends, and risk areas.",
      code: "complexity analyze ./src\n# Scanning 342 files...\n# Found 12 high-risk functions",
      highlight: "Real-time feedback"
    },
    {
      number: "03",
      icon: Shield,
      title: "Enforce Standards",
      description: "Block PRs that exceed thresholds. Get inline comments on risky code. Track complexity trends over time.",
      code: "# PR Check Failed\n# Function 'processOrders' exceeds\n# complexity limit (CC: 28 > 15)",
      highlight: "Automated quality gates"
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-background border-y border-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono font-semibold text-primary tracking-wider uppercase mb-6">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Production-Ready in <span className="text-primary">Three Steps</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            From installation to enforcement in minutes, not weeks. Built for teams that ship fast.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="group relative">
                {/* Connector Line (hidden on mobile, visible on desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-0.5 bg-gradient-to-r from-primary/50 to-border z-0" />
                )}
                
                <div className="relative p-8 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/70 transition-all duration-300 h-full">
                  {/* Step Number Badge */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-lg bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Code Example */}
                  <div className="relative rounded-md bg-muted/50 border border-border/50 p-4 font-mono text-sm overflow-x-auto">
                    <div className="absolute top-2 right-2 text-xs text-muted-foreground/50 uppercase tracking-wider">
                      {step.highlight}
                    </div>
                    <pre className="text-foreground/80">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <a 
            href="/docs" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            Read full documentation
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

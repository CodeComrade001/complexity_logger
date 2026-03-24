import { cn } from "../../lib/utils";
import { AlertTriangle } from "lucide-react";

export function ComplexityVisualizer() {
  const tiers = [
    {
      label: "O(1)",
      color: "bg-emerald-500",
      height: "h-8",
      risk: "Constant",
      description: "Optimal"
    },
    {
      label: "O(log n)",
      color: "bg-cyan-500",
      height: "h-12",
      risk: "Logarithmic",
      description: "Excellent"
    },
    {
      label: "O(n)",
      color: "bg-blue-500",
      height: "h-20",
      risk: "Linear",
      description: "Good"
    },
    {
      label: "O(n log n)",
      color: "bg-yellow-500",
      height: "h-32",
      risk: "Linearithmic",
      description: "Acceptable"
    },
    {
      label: "O(n²)",
      color: "bg-orange-500",
      height: "h-48",
      risk: "Quadratic",
      description: "Risky"
    },
    {
      label: "O(2ⁿ)",
      color: "bg-red-500",
      height: "h-64",
      risk: "Exponential",
      description: "Dangerous"
    },
    {
      label: "O(n!)",
      color: "bg-red-700",
      height: "h-80",
      risk: "Factorial",
      description: "Critical"
    },
  ];

  const keyCapabilities = [
    "Cyclomatic Complexity (McCabe)",
    "Cognitive Complexity (SonarSource)",
    "Halstead Metrics",
    "Maintainability Index",
    "Nesting Depth Analysis",
    "Control Flow Graph"
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-background via-muted/10 to-background border-b border-border relative overflow-hidden" id="visualizer">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">

          {/* Left: Content */}
          <div className="space-y-8">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono font-semibold text-primary tracking-wider uppercase mb-6">
                Visual Intelligence
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                See Complexity <br />
                <span className="text-primary">Before It Scales</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                Most tools report syntax errors. We reveal algorithmic time bombs.
                Understand what O(n!) means for your production system—before deployment.
              </p>
            </div>

            {/* Key Capabilities List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Analysis Capabilities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyCapabilities.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                    <span className="font-mono text-sm text-foreground/80 group-hover:text-primary transition-colors">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Callout */}
            <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
              <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-1">Performance Impact</p>
                <p className="text-muted-foreground">
                  A single O(n²) loop in a hot path can turn 100ms requests into 10-second hangs.
                  We catch these before they reach production.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Complexity Chart */}
          <div className="relative">
            {/* Chart Container */}
            <div className="relative h-[500px] rounded-lg border border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm p-8 overflow-hidden">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Y-Axis Label */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-mono text-muted-foreground tracking-wider uppercase">
                Runtime Growth
              </div>

              {/* Chart Bars */}
              <div className="relative h-full flex items-end justify-between gap-2 pl-8 pr-4 pb-12">
                {tiers.map((tier, index) => (
                  <div key={index} className="flex flex-col items-center gap-2 z-10 flex-1 group">
                    {/* Bar */}
                    <div
                      className={cn(
                        "relative w-full rounded-t-sm transition-all duration-500 ease-out cursor-pointer",
                        tier.color,
                        tier.height,
                        "hover:brightness-110 hover:shadow-lg"
                      )}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'slideUp 0.6s ease-out forwards'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-semibold px-3 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border z-20 pointer-events-none">
                        <div className="font-bold mb-1">{tier.risk}</div>
                        <div className="text-muted-foreground">{tier.description}</div>
                      </div>

                      {/* Glow Effect */}
                      <div className={cn(
                        "absolute inset-0 rounded-t-sm opacity-0 group-hover:opacity-50 transition-opacity blur-md",
                        tier.color
                      )} />
                    </div>

                    {/* Label */}
                    <span className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                      {tier.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* X-Axis Label */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono text-muted-foreground tracking-wider uppercase">
                Algorithm Complexity
              </div>

              {/* Danger Zone Indicator */}
              <div className="absolute right-4 top-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-red-500">Danger Zone</span>
              </div>
            </div>

            {/* Floating Stat Card */}
            <div className="absolute -bottom-6 -left-6 p-4 rounded-lg border border-border/50 bg-card shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary">87%</div>
              <div className="text-xs text-muted-foreground font-medium">Issues Prevented</div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 0.8;
          }
        }
      `}</style>
    </section>
  );
}
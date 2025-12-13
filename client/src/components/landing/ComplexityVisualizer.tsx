import { cn } from "../../lib/utils";

export function ComplexityVisualizer() {
  const tiers = [
    { label: "O(1)", color: "bg-emerald-500", height: "h-4", width: "w-4", risk: "Low" },
    { label: "O(n)", color: "bg-blue-500", height: "h-8", width: "w-16", risk: "Low" },
    { label: "O(log n)", color: "bg-cyan-500", height: "h-6", width: "w-8", risk: "Safe" },
    { label: "O(n²)", color: "bg-yellow-500", height: "h-16", width: "w-32", risk: "Medium" },
    { label: "O(2^n)", color: "bg-orange-600", height: "h-32", width: "w-48", risk: "High" },
    { label: "O(n!)", color: "bg-red-600", height: "h-64", width: "w-full", risk: "Critical" },
  ];

  return (
    <section className="py-24 bg-muted/5 border-b border-border" id="features">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Visualize Logic <br />
              <span className="text-primary">Before It Breaks.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most tools show you syntax errors. We show you structural risk.
              Understand the time and space complexity of your functions
              instantly.
            </p>

            <div className="space-y-4">
              {["Cognitive Complexity", "Halstead Metrics", "Maintainability Index"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[400px] w-full glass-panel rounded-sm p-8 flex items-end justify-between gap-4 overflow-hidden border border-border/50">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>

            {tiers.map((tier, index) => (
              <div key={index} className="flex flex-col items-center gap-2 z-10 w-full">
                <div className={cn("relative w-full rounded-sm opacity-80 hover:opacity-100 transition-all duration-300 group", tier.color, tier.height)}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs font-bold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
                    {tier.risk} Risk
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-muted-foreground">{tier.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
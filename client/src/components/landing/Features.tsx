import { Code2, Gauge, Database, Zap, GitCompare, Lock, Globe, TrendingUp } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Code2,
      title: "Multi-Language Support",
      description: "Native AST parsers for JavaScript, TypeScript, Python, Go, Rust, Java, and C++. No regex hacks.",
      tags: ["JS/TS", "Python", "Go", "Rust"]
    },
    {
      icon: Gauge,
      title: "Halstead Metrics",
      description: "Program vocabulary, length, volume, and difficulty scores. Predict maintenance effort scientifically.",
      tags: ["Quantitative", "Research-backed"]
    },
    {
      icon: Database,
      title: "Cognitive Complexity",
      description: "Beyond cyclomatic — measure actual human comprehension difficulty with linear nesting weights.",
      tags: ["SonarSource standard"]
    },
    {
      icon: Zap,
      title: "Incremental Analysis",
      description: "Only re-analyze changed files. Sub-second feedback on 100k+ LOC codebases via dependency graphs.",
      tags: ["Fast", "Scalable"]
    },
    {
      icon: GitCompare,
      title: "Diff-Aware Reports",
      description: "See exactly what your PR changed. Compare complexity deltas, not just absolute values.",
      tags: ["PR-first"]
    },
    {
      icon: Lock,
      title: "Custom Thresholds",
      description: "Per-language, per-directory, per-team limits. Enforce stricter rules for critical paths.",
      tags: ["Flexible"]
    },
    {
      icon: Globe,
      title: "Framework Detection",
      description: "Automatically adjusts analysis for React, Vue, Django, Rails, Spring. Context-aware scoring.",
      tags: ["Smart"]
    },
    {
      icon: TrendingUp,
      title: "Trend Tracking",
      description: "Historical dashboards show complexity evolution. Detect regressions before they compound.",
      tags: ["Analytics"]
    }
  ];

  return (
    <section className="py-24 lg:py-32 bg-muted/20 border-b border-border relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-mono font-semibold text-primary tracking-wider uppercase mb-6">
            Technical Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Compiler-Grade Analysis <br />
            <span className="text-primary">Without the Compile Time</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Built on research-backed algorithms and production-proven parsers. 
            Not another linter wrapper.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group relative p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon Container */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="inline-block px-2 py-1 rounded text-xs font-mono font-medium bg-primary/10 text-primary/80 border border-primary/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Hover Effect Gradient */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Additional Info Bar */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm text-muted-foreground font-medium">Supported Languages</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">&lt;100ms</div>
              <div className="text-sm text-muted-foreground font-medium">Analysis Time (avg file)</div>
            </div>
            <div className="text-center p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm">
              <div className="text-3xl font-bold text-primary mb-2">Zero</div>
              <div className="text-sm text-muted-foreground font-medium">False Positives Target</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

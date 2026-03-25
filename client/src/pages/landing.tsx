import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Code2, Cpu, GitMerge, CheckCircle2, Activity, Zap, Shield } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen  flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background Effects */}
        {/* <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 dark:opacity-30 translate-x-1/2 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 dark:opacity-30 -translate-x-1/2 translate-y-1/4" />
        </div> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Now in Public Beta
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Reduce Code <br />
                <span className="text-gradient">Complexity</span> to Zero.
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                Automatically detect O(n²), deeply nested loops, and cyclomatic nightmares before they reach production. The ultimate static analysis tool for modern teams.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(0,191,255,0.3)] hover:shadow-[0_0_30px_rgba(0,191,255,0.5)] transition-all">
                    Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base bg-background/50 backdrop-blur-sm border-border hover:bg-muted">
                    View Interactive Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" /> No credit card req.</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" /> 14-day free trial</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:h-[500px] w-full rounded-2xl overflow-hidden glass-panel flex items-center justify-center border-border/50"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
                alt="Abstract representation of code complexity analysis"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity"
              />

              {/* Mock UI overlay floating on top of the image */}
              <div className="relative z-10 w-[80%] max-w-md bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-6 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-sm">api/user-controller.ts</span>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-bold bg-destructive/20 text-destructive border border-destructive/30">O(n²) Detected</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground space-y-2 mb-6 opacity-70">
                  <p><span className="text-secondary">for</span> (let i = 0; i &lt; users.length; i++) {'{'}</p>
                  <p className="pl-4"><span className="text-secondary">for</span> (let j = 0; j &lt; roles.length; j++) {'{'}</p>
                  <p className="pl-8 text-destructive border-b border-destructive/30 border-dashed pb-1">// Nested iteration causes exponential slowdown</p>
                  <p className="pl-8 text-destructive">const match = await checkRole(users[i], roles[j]);</p>
                  <p className="pl-4">{'}'}</p>
                  <p>{'}'}</p>
                </div>
                <Button className="w-full text-xs h-8 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30">Auto-Refactor to O(n)</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-card/30 border-y border-border/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Deep analysis, <span className="text-gradient-subtle">simple insights.</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We parse your AST, measure cyclomatic complexity, and estimate Big O notation for every single function in your codebase.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Cpu,
                title: "Cyclomatic Analysis",
                desc: "Calculate independent paths through your code to pinpoint unmaintainable spaghetti functions."
              },
              {
                icon: GitMerge,
                title: "CI/CD Integration",
                desc: "Block pull requests automatically if they increase the overall complexity score above your threshold."
              },
              {
                icon: Activity,
                title: "Smart Thresholds",
                desc: "Set language-specific limits. Allow higher complexity in Rust algorithms, strictly enforce React components."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl glass-panel hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t border-border/40 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg text-foreground tracking-tight">Complexity Zero</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">© {new Date().getFullYear()} Complexity Zero Inc. All rights reserved.</p>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
            <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

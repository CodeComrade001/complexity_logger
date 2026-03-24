import { Link, useLocation } from "react-router-dom";
import { Terminal, Github, Smartphone, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { ThemeToggle } from "../ThemeToggle";
import { useState } from "react";

interface NavigationProps {
  navigationHref: string;
  navigationLabel: string;
}

export function Layout({
  children,
  navigationData,
}: {
  children: React.ReactNode;
  navigationData: NavigationProps[];
}) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans flex flex-col relative overflow-x-hidden">
      {/* ── Background ambient glow orbs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--glow-primary) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--glow-accent) 0%, transparent 70%)",
            animationDelay: "1.5s",
          }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, var(--glow-accent) 0%, transparent 70%)",
            animationDelay: "2.5s",
          }}
        />
      </div>

      {/* ── Mobile Dashboard Warning ── */}
      {isDashboard && (
        <div className="md:hidden relative z-40 border-b border-yellow-500/20 p-3 flex items-center justify-center gap-2 text-xs font-mono text-yellow-400 bg-yellow-500/5 backdrop-blur-sm">
          <Smartphone className="h-4 w-4" />
          <span>Switch to desktop for full analysis tools</span>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)]/50 glass">
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] animate-shimmer opacity-60"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--primary), transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-all duration-300"
          >
            <div className="relative">
              {/* Logo glow */}
              <div className="absolute inset-0 rounded-xl bg-[var(--primary)] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
              <div className="relative bg-[var(--primary)]/10 p-2.5 rounded-xl border border-[var(--primary)]/20 group-hover:border-[var(--primary)]/60 transition-all duration-300 group-hover:shadow-[0_0_20px_var(--glow-primary)]">
                <Terminal className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </div>
            <span className="font-mono font-bold text-lg tracking-tight">
              COMPLEXITY
              <span className="gradient-text">ZERO</span>
            </span>
          </Link>

          {/* Navigation — centered */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1 bg-[var(--muted)]/40 border border-[var(--border)]/50 rounded-xl p-1 backdrop-blur-sm">
              {navigationData.map((item, index) => {
                const isActive = location.pathname === item.navigationHref;
                return (
                  <Link
                    key={index}
                    to={item.navigationHref}
                    className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                      ? "text-[var(--primary-foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      }`}
                  >
                    {/* Active indicator with glow */}
                    {isActive && (
                      <span className="absolute inset-0 rounded-lg bg-[var(--primary)] shadow-[0_0_16px_var(--glow-primary)] transition-all duration-300" />
                    )}
                    <span className="relative z-10">{item.navigationLabel}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {!isDashboard ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <button className="font-mono text-xs">
                    Log In
                  </button>
                </Link>
                <Link to="/login">
                  <button className="font-mono text-xs gap-2">
                    <Github className="h-3.5 w-3.5" />
                    Start Analysis
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500" />
                  <div className="relative h-9 w-9 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center text-xs font-mono font-bold text-[var(--primary)] group-hover:border-[var(--primary)]/60 transition-all duration-300">
                    JD
                  </div>
                </div>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer"
            >
              <div className="w-4 h-4 flex flex-col justify-center gap-1">
                <span
                  className={`block h-[2px] bg-[var(--foreground)] rounded transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-[3px]" : ""
                    }`}
                />
                <span
                  className={`block h-[2px] bg-[var(--foreground)] rounded transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-[3px]" : ""
                    }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)]/50 glass animate-float-up">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navigationData.map((item, index) => {
                const isActive = location.pathname === item.navigationHref;
                return (
                  <Link
                    key={index}
                    to={item.navigationHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-[inset_0_0_12px_var(--glow-soft)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50"
                      }`}
                  >
                    {item.navigationLabel}
                  </Link>
                );
              })}
              {!isDashboard && (
                <div className="flex items-center gap-2 pt-3 mt-2 border-t border-[var(--border)]/30">
                  <Link to="/login" className="flex-1">
                    <button className="w-full font-mono text-xs">
                      Log In
                    </button>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <button className="w-full font-mono text-xs gap-2">
                      <Github className="h-3.5 w-3.5" />
                      Start
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col relative z-10">{children}</main>

      {/* ── Footer ── */}
      {!isDashboard && (
        <footer className="relative z-10 border-t border-[var(--border)]/50 py-16 bg-[var(--muted)]/10">
          {/* Footer top glow line */}
          <div
            className="absolute top-0 left-1/4 right-1/4 h-[1px] opacity-40"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--primary), transparent)",
            }}
          />

          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--primary)]/10 p-2 rounded-lg border border-[var(--primary)]/20">
                  <Terminal className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <span className="font-mono font-bold text-[var(--muted-foreground)]">
                  COMPLEXITY<span className="gradient-text">ZERO</span>
                </span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm">
                Static analysis platform for engineering teams. Detect complexity
                spikes before they merge. Keep your codebase clean, fast, and
                maintainable.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#"
                  className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-[0_0_12px_var(--glow-soft)] transition-all duration-300 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-[0_0_12px_var(--glow-soft)] transition-all duration-300 text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                >
                  <Terminal className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                Product
              </h4>
              <ul className="space-y-2.5">
                {["Features", "Pricing", "Changelog", "Roadmap"].map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      {link}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                Resources
              </h4>
              <ul className="space-y-2.5">
                {["Documentation", "API Reference", "GitHub", "Support"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors duration-200 flex items-center gap-1.5 group"
                      >
                        {link}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-[var(--border)]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--muted-foreground)]/60 font-mono">
              © 2025 ComplexityZero. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]/60">
              <a href="#" className="hover:text-[var(--primary)] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[var(--primary)] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[var(--primary)] transition-colors">
                Status
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

import { ComplexityVisualizer } from "../components/landing/ComplexityVisualizer";
import { Hero } from "../components/landing/Hero";
import { Layout } from "../components/layout/Layout";

export default function LandingPage() {
  return (
    <Layout>
      <div className="flex flex-col">
        <Hero />
        <ComplexityVisualizer />

        {/* Simple CTA Section */}
        <section className="py-24 bg-background border-t border-border text-center">
          <div className="container mx-auto px-4 max-w-2xl space-y-8">
            <h2 className="text-3xl font-bold">Ready to optimize?</h2>
            <p className="text-muted-foreground">Start analyzing your codebase today. No credit card required for open source projects.</p>
            <div className="flex justify-center">
              <a href="/login" className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Get Started for Free
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
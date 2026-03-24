import { ComplexityVisualizer } from "../components/landing/ComplexityVisualizer";
import { Differentiation } from "../components/landing/Differentiation";
import { Features } from "../components/landing/Features";
import { FinalCTA } from "../components/landing/FinalCTA";
import { Hero } from "../components/landing/Hero";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Layout } from "../components/layout/Layout";

export default function LandingPage() {

  const navigationDataItems = [
    { navigationLabel: "Dashboard", navigationHref: "/dashboard" },
    { navigationLabel: "Login", navigationHref: "/login" },
    { navigationLabel: "Customer Care", navigationHref: "/customer-care" },
  ];

  return (
    <Layout navigationData={navigationDataItems}>
      <div className="flex flex-col">
        {/* Hero Section - Strong first impression */}
        <Hero />

        {/* Visual Product Preview - Show what users get */}
        <ComplexityVisualizer />

        {/* How It Works - Simple 3-step process */}
        <HowItWorks />

        {/* Features - Technical capabilities */}
        <Features />

        {/* Differentiation - Why we're better */}
        <Differentiation />

        {/* Final CTA - Strong conversion focus */}
        <FinalCTA />
      </div>
    </Layout>
  );
}
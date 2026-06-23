import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { DbMarquee } from "@/components/landing/db-marquee";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <DbMarquee />
        <FeatureGrid />
        <HowItWorks />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

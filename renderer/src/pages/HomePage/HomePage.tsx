import { Header } from "./Components/Header";
import { HeroSection } from "./Components/HeroSection";
import { CapabilitiesSection } from "./Components/CapabilitiesSection";
import { AppPreviewSection } from "./Components/AppPreviewSection";
import { FeaturesGridSection } from "./Components/FeaturesSection";
import { BottomCTASection } from "./Components/BottomCTASection";
import { Footer } from "./Components/Footer";

// 1. Extracted the complex SVG into a clean, reusable local component

export default function Home() {
  const scrollToCapabilities = (e: React.MouseEvent) => {
    e.preventDefault();
    document
      .getElementById("capabilities")
      ?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300 min-w-[320px] selection:bg-light-primary selection:text-white dark:selection:bg-dark-primary dark:selection:text-black relative w-full h-screen overflow-y-auto overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-surface/30 to-light-bg dark:from-transparent dark:via-dark-bg/80 dark:to-dark-bg"></div>
        <div className="absolute inset-0 neural-bg animate-pan opacity-60 dark:opacity-40"></div>
      </div>
      {/* Header */}
      <Header />

      <main className="w-full relative z-10">
        {/* HERO SECTION */}
        <HeroSection scrollToCapabilities={scrollToCapabilities} />

        {/* CAPABILITIES SECTION */}
        <CapabilitiesSection />

        {/* SECOND BRAIN VISUALIZATION SECTION */}

        <AppPreviewSection />

        {/* FEATURES GRID SECTION */}

        <FeaturesGridSection />

        {/* BOTTOM CTA SECTION */}

        <BottomCTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

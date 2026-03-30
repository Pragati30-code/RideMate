import Navbar          from "@/components/home/Navbar";
import HeroSection     from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTABanner       from "@/components/home/CTABanner";
import Footer          from "@/components/home/Footer";
import { globalStyles } from "@/components/home/styles";

export default function Home() {
  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #fdf6ec 0%, #fef3e8 50%, #fdf0f8 100%)" }}
    >
      <style>{globalStyles}</style>

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
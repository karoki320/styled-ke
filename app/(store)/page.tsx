import { Hero } from "@/components/store/Hero";
import { TrustBar } from "@/components/store/TrustBar";
import { FreshArrivals } from "@/components/store/FreshArrivals";
import { BrandStory } from "@/components/store/BrandStory";
import { Testimonials } from "@/components/store/Testimonials";
import { TikTokSection } from "@/components/store/TikTokSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <FreshArrivals />
      <BrandStory />
      <Testimonials />
      <TikTokSection />
    </>
  );
}

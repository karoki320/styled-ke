import { Hero } from "@/components/store/Hero";
import { TrustBar } from "@/components/store/TrustBar";
import { Categories } from "@/components/store/Categories";
import { FreshArrivals } from "@/components/store/FreshArrivals";
import { BrandStory } from "@/components/store/BrandStory";
import { Testimonials } from "@/components/store/Testimonials";
import { TikTokSection } from "@/components/store/TikTokSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Categories />
      <FreshArrivals />
      <BrandStory />
      <Testimonials />
      <TikTokSection />
    </>
  );
}

import { Hero } from "@/components/store/Hero";
import { TrustBar } from "@/components/store/TrustBar";
import { FreshArrivals } from "@/components/store/FreshArrivals";
import { BrandStory } from "@/components/store/BrandStory";
import { Testimonials } from "@/components/store/Testimonials";
import { TikTokSection } from "@/components/store/TikTokSection";
import { getAllProducts } from "@/lib/supabase/products";

export const revalidate = 60; // cache the page for 60s and serve it instantly; refresh in the background

export default async function HomePage() {
  const products = await getAllProducts();
  return (
    <>
      <Hero />
      <TrustBar />
      <FreshArrivals products={products.slice(0, 8)} />
      <BrandStory />
      <Testimonials />
      <TikTokSection />
    </>
  );
}

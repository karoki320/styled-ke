import type { Metadata } from "next";
import { ShopGrid } from "@/components/store/ShopGrid";
import { getAllProducts } from "@/lib/supabase/products";

export const metadata: Metadata = {
  title: "Shop All | Styled.ke",
  description: "Browse all Styled.ke fashion — dresses, tops and more, all KES 1,500.",
};

export const dynamic = "force-dynamic";

export default async function ShopAllPage() {
  const products = await getAllProducts();
  return <ShopGrid filter="Shop All" products={products} />;
}

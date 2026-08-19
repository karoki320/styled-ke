import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopGrid, type ShopFilter } from "@/components/store/ShopGrid";
import { getAllProducts } from "@/lib/supabase/products";

const SLUG_MAP: Record<string, ShopFilter> = {
  clothing: "Clothing",
  sale: "Sale",
};

export const revalidate = 60; // cache the page for 60s and serve it instantly; refresh in the background

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const filter = SLUG_MAP[params.category];
  return { title: filter ? `${filter} | Styled.ke` : "Shop | Styled.ke" };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const filter = SLUG_MAP[params.category];
  if (!filter) notFound();
  const products = await getAllProducts();
  return <ShopGrid filter={filter} products={products} />;
}

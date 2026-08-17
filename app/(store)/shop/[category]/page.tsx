import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopGrid, type ShopFilter } from "@/components/store/ShopGrid";

const SLUG_MAP: Record<string, ShopFilter> = {
  clothing: "Clothing",
  sale: "Sale",
};

export function generateStaticParams() {
  return Object.keys(SLUG_MAP).map((category) => ({ category }));
}

export function generateMetadata({
  params,
}: {
  params: { category: string };
}): Metadata {
  const filter = SLUG_MAP[params.category];
  return { title: filter ? `${filter} | Styled.ke` : "Shop | Styled.ke" };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const filter = SLUG_MAP[params.category];
  if (!filter) notFound();
  return <ShopGrid filter={filter} />;
}

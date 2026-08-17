import type { Metadata } from "next";
import { ShopGrid } from "@/components/store/ShopGrid";

export const metadata: Metadata = {
  title: "Shop All | Styled.ke",
  description: "Browse all Styled.ke fashion, perfumes and bath & body products.",
};

export default function ShopAllPage() {
  return <ShopGrid filter="Shop All" />;
}

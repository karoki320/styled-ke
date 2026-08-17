import type { Metadata } from "next";
import { ShopGrid } from "@/components/store/ShopGrid";

export const metadata: Metadata = {
  title: "Shop All | Styled.ke",
  description: "Browse all Styled.ke fashion — dresses, tops and more, all KES 1,500.",
};

export default function ShopAllPage() {
  return <ShopGrid filter="Shop All" />;
}

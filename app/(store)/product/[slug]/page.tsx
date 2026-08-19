import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/supabase/products";
import { ProductDetail } from "@/components/store/ProductDetail";

export const revalidate = 60; // cache the page for 60s and serve it instantly; refresh in the background

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found | Styled.ke" };
  return {
    title: `${product.name} | Styled.ke`,
    description: product.description,
    openGraph: { images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const products = await getAllProducts();
  const product = products.find((p) => p.slug === params.slug);
  if (!product) notFound();
  const related = getRelatedProducts(product, products);
  return <ProductDetail product={product} related={related} />;
}

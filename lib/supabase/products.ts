import { createPublicClient } from "@/lib/supabase/server";
import { PRODUCTS as FALLBACK_PRODUCTS } from "@/lib/mock-data";
import type { Product } from "@/types";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_price: number | string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  sku: string | null;
};

type ImageRow = {
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
};

type VariantRow = {
  product_id: string;
  name: string;
};

function mapProduct(row: ProductRow, images: ImageRow[], variants: VariantRow[]): Product {
  const ownImages = images
    .filter((i) => i.product_id === row.id)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order);
  const ownVariants = variants.filter((v) => v.product_id === row.id).map((v) => v.name);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    category: "Clothing",
    price: Number(row.price),
    compare_price: row.compare_price != null ? Number(row.compare_price) : null,
    stock_quantity: row.stock_quantity,
    low_stock_threshold: row.low_stock_threshold,
    badge: (row.badge as Product["badge"]) ?? null,
    is_active: row.is_active,
    is_featured: row.is_featured,
    sku: row.sku || "",
    image: ownImages[0]?.image_url || "/images/IMG_MARBLE.jpg",
    alt_image: ownImages[1]?.image_url || null,
    colors: ownVariants.length > 0 ? ownVariants : undefined,
  };
}

/** Reads the live product catalogue from Supabase (products + product_images +
 * product_variants). Falls back to the bundled mock catalogue if Supabase
 * isn't configured yet, or the query fails, so the storefront never renders
 * empty. */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data: rows, error } = await supabase
      .from("products")
      .select(
        "id, name, slug, description, price, compare_price, stock_quantity, low_stock_threshold, badge, is_active, is_featured, sku"
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!rows || rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const [{ data: images }, { data: variants }] = await Promise.all([
      supabase
        .from("product_images")
        .select("product_id, image_url, alt_text, display_order, is_primary")
        .in("product_id", ids),
      supabase.from("product_variants").select("product_id, name").in("product_id", ids),
    ]);

    return rows.map((r) => mapProduct(r, images || [], variants || []));
  } catch (err) {
    console.error("Falling back to mock product catalogue:", err);
    return FALLBACK_PRODUCTS;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  return all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit);
}

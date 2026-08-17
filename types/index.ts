// Core domain types — mirror the Supabase schema (supabase/migrations/0001_init.sql)
// so mock data, API routes, and components all agree on shape.

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "paystack" | "mpesa" | "cash_pos";
export type OrderSource = "website" | "pos" | "whatsapp";
export type DeliveryMethodId = "rider" | "matatu" | "mtaani" | "doorstep";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  image_url: string | null;
  stock_quantity: number;
  price_modifier: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "Clothing" | "Perfumes" | "Bath & Body";
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  badge: "NEW" | "SALE" | null;
  is_active: boolean;
  is_featured: boolean;
  sku: string;
  image: string;
  alt_image?: string | null;
  colors?: string[];
}

export interface CartLineItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  variant?: string;
  qty: number;
}

export interface DeliveryOption {
  id: DeliveryMethodId;
  label: string;
  icon: import("lucide-react").LucideIcon;
  desc: string;
  fee: number;
  feeLabel: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items_summary: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  source: OrderSource;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  delivery_method: DeliveryMethodId | null;
  delivery_location: string;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  whatsapp_phone?: string;
  email?: string;
  city: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  content: string;
  is_bot: boolean;
  created_at: string;
  status: "sent" | "delivered" | "read" | "failed";
}

export interface WhatsAppConversation {
  id: string;
  customer_name: string;
  wa_phone: string;
  status: "open" | "resolved" | "bot";
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface AutomationFlow {
  id: string;
  name: string;
  trigger_keyword: string;
  response_type: "text" | "list" | "button";
  response_content: string;
  is_active: boolean;
  trigger_count: number;
}

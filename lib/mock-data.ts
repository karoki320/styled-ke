// Mock data used throughout the app so every page is fully clickable before
// Supabase is connected. Once live, replace these reads with Supabase queries
// (see hooks/useProducts.ts, hooks/useOrders.ts for the swap points).
import type {
  Product,
  Category,
  Order,
  Customer,
  DeliveryOption,
  DeliveryZone,
  WhatsAppConversation,
  WhatsAppMessage,
  AutomationFlow,
} from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "cat-clothing",
    name: "Clothing",
    slug: "clothing",
    description: "Dresses & tops — all KES 1,500",
    image_url: "/images/IMG_ORANGE.jpg",
    display_order: 1,
    is_active: true,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Abstract Kaftan Top – Orange/Red",
    slug: "abstract-kaftan-top-orange-red",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 8,
    low_stock_threshold: 5,
    image: "/images/IMG_ORANGE.jpg",
    alt_image: "/images/IMG_BLUE.jpg",
    description:
      "Bold abstract print kaftan top in vibrant orange, red and pink. Flowy, flattering, and incredibly comfortable. Pairs perfectly with leggings or wide-leg pants. One size fits most.",
    colors: ["Orange / Red", "Blue / White"],
    is_active: true,
    is_featured: true,
    sku: "SK-CL-001",
  },
  {
    id: "2",
    name: "Abstract Kaftan Top – Blue/White",
    slug: "abstract-kaftan-top-blue-white",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 6,
    low_stock_threshold: 5,
    image: "/images/IMG_BLUE.jpg",
    alt_image: "/images/IMG_ORANGE.jpg",
    description:
      "Cool-toned abstract print kaftan top in ocean blues and white. The same flattering flowy cut — perfect for the office or a casual day out. One size fits most.",
    colors: ["Blue / White", "Orange / Red"],
    is_active: true,
    is_featured: true,
    sku: "SK-CL-002",
  },
  {
    id: "3",
    name: "Pleated Chiffon Dress – Black",
    slug: "pleated-chiffon-dress-black",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 4,
    low_stock_threshold: 5,
    image: "/images/IMG_BLACK.jpg",
    alt_image: "/images/IMG_PURPLE.jpg",
    description:
      "Elegant pleated chiffon two-layer dress in classic black. Bat-wing sleeves, cascading layered skirt — effortlessly chic for events, church, or dinner.",
    colors: ["Black", "Purple"],
    is_active: true,
    is_featured: true,
    sku: "SK-CL-003",
  },
  {
    id: "4",
    name: "Pleated Chiffon Dress – Purple",
    slug: "pleated-chiffon-dress-purple",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 3,
    low_stock_threshold: 5,
    image: "/images/IMG_PURPLE.jpg",
    alt_image: "/images/IMG_BLACK.jpg",
    description:
      "Make a statement in this gorgeous purple pleated chiffon dress. The rich amethyst colour and flattering layered silhouette command attention at any occasion.",
    colors: ["Purple", "Black"],
    is_active: true,
    is_featured: true,
    sku: "SK-CL-004",
  },
  {
    id: "5",
    name: "Feather Print Belted Midi Dress",
    slug: "feather-print-belted-midi-dress",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 5,
    low_stock_threshold: 5,
    image: "/images/IMG_GREY.jpg",
    description:
      "Sophisticated steel-blue feather print midi dress with button detail and matching belt. Long bishop sleeves add elegance. Perfect for formal occasions and professional settings.",
    is_active: true,
    is_featured: true,
    sku: "SK-CL-005",
  },
  {
    id: "6",
    name: "Marble Print Midi Dress",
    slug: "marble-print-midi-dress",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 7,
    low_stock_threshold: 5,
    image: "/images/IMG_MARBLE.jpg",
    description:
      "Stunning marble print midi dress in navy, brown and white. Three-quarter puff sleeves with a full A-line skirt. Eye-catching, elegant and effortlessly unique.",
    is_active: true,
    is_featured: true,
    sku: "SK-CL-006",
  },
  {
    id: "7",
    name: "Belted Maxi Dress – Beige",
    slug: "belted-maxi-dress-beige",
    price: 1500,
    compare_price: null,
    badge: "NEW",
    category: "Clothing",
    stock_quantity: 5,
    low_stock_threshold: 5,
    image: "/images/IMG_BEIGE.jpg",
    description:
      "Classic belted maxi dress in warm beige with striped belt and collar detail. Long flowing silhouette, gold button accents. Sophisticated and versatile for any occasion.",
    is_active: true,
    is_featured: true,
    sku: "SK-CL-007",
  },
];

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "rider",
    label: "Rider Delivery",
    icon: "🏍️",
    desc: "Boda boda to your door — fee quoted by rider",
    fee: 0,
    feeLabel: "Fee on delivery",
  },
  {
    id: "matatu",
    label: "Matatu",
    icon: "🚌",
    desc: "Via matatu / public transport",
    fee: 0,
    feeLabel: "Varies by route",
  },
  {
    id: "mtaani",
    label: "Pick Up Mtaani",
    icon: "📍",
    desc: "Neighbourhood pickup point — KES 140",
    fee: 140,
    feeLabel: "KES 140",
  },
  {
    id: "doorstep",
    label: "Doorstep Pickup",
    icon: "🚪",
    desc: "Delivery right to your nearest doorstep",
    fee: 350,
    feeLabel: "KES 350+",
  },
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  { id: "z1", name: "Westlands", fee: 0, is_active: true },
  { id: "z2", name: "Kilimani / Kileleshwa", fee: 0, is_active: true },
  { id: "z3", name: "Karen / Langata", fee: 200, is_active: true },
  { id: "z4", name: "Thika Road", fee: 150, is_active: true },
  { id: "z5", name: "Mombasa Rd", fee: 200, is_active: true },
  { id: "z6", name: "Outside Nairobi (courier)", fee: 350, is_active: true },
];

export const ORDERS: Order[] = [
  {
    id: "o91",
    order_number: "#SK-0091",
    customer_name: "Amina Wanjiru",
    customer_phone: "0712 344 512",
    items_summary: "Marble Dress, Kaftan Top",
    subtotal: 3000,
    delivery_fee: 0,
    total: 3000,
    status: "delivered",
    source: "website",
    payment_method: "mpesa",
    payment_status: "paid",
    delivery_method: "rider",
    delivery_location: "Westlands",
    created_at: "2026-07-20",
  },
  {
    id: "o90",
    order_number: "#SK-0090",
    customer_name: "Cynthia Mwangi",
    customer_phone: "0723 891 004",
    items_summary: "Beige Maxi Dress",
    subtotal: 1500,
    delivery_fee: 0,
    total: 1500,
    status: "shipped",
    source: "website",
    payment_method: "mpesa",
    payment_status: "paid",
    delivery_method: "rider",
    delivery_location: "Kileleshwa",
    created_at: "2026-07-19",
  },
  {
    id: "o89",
    order_number: "#SK-0089",
    customer_name: "Fatuma Khalid",
    customer_phone: "0701 223 445",
    items_summary: "Chanel No.5",
    subtotal: 8500,
    delivery_fee: 350,
    total: 8850,
    status: "processing",
    source: "whatsapp",
    payment_method: "mpesa",
    payment_status: "paid",
    delivery_method: "doorstep",
    delivery_location: "Mombasa",
    created_at: "2026-07-20",
  },
  {
    id: "o88",
    order_number: "#SK-0088",
    customer_name: "Grace Otieno",
    customer_phone: "0745 667 221",
    items_summary: "Purple Chiffon Dress x2",
    subtotal: 3000,
    delivery_fee: 0,
    total: 3000,
    status: "delivered",
    source: "pos",
    payment_method: "cod",
    payment_status: "paid",
    delivery_method: "rider",
    delivery_location: "Karen",
    created_at: "2026-07-18",
  },
  {
    id: "o87",
    order_number: "#SK-0087",
    customer_name: "Joyce Kamau",
    customer_phone: "0733 112 089",
    items_summary: "Feather Midi Dress, VS Mist",
    subtotal: 3700,
    delivery_fee: 0,
    total: 3700,
    status: "delivered",
    source: "website",
    payment_method: "mpesa",
    payment_status: "paid",
    delivery_method: "rider",
    delivery_location: "Lavington",
    created_at: "2026-07-17",
  },
  {
    id: "o86",
    order_number: "#SK-0086",
    customer_name: "Mary Njoroge",
    customer_phone: "0790 554 321",
    items_summary: "Marble Print Dress",
    subtotal: 1500,
    delivery_fee: 150,
    total: 1650,
    status: "pending",
    source: "website",
    payment_method: "mpesa",
    payment_status: "pending",
    delivery_method: "mtaani",
    delivery_location: "Thika",
    created_at: "2026-07-20",
  },
];

export const CUSTOMERS: Customer[] = [
  { id: "c1", full_name: "Amina Wanjiru", phone: "0712 344 512", city: "Westlands", total_orders: 8, total_spent: 24000, last_order_at: "2026-07-20" },
  { id: "c2", full_name: "Cynthia Mwangi", phone: "0723 891 004", city: "Kileleshwa", total_orders: 5, total_spent: 12500, last_order_at: "2026-07-19" },
  { id: "c3", full_name: "Fatuma Khalid", phone: "0701 223 445", city: "Mombasa", total_orders: 3, total_spent: 18500, last_order_at: "2026-07-20" },
  { id: "c4", full_name: "Grace Otieno", phone: "0745 667 221", city: "Karen", total_orders: 12, total_spent: 36000, last_order_at: "2026-07-18" },
  { id: "c5", full_name: "Joyce Kamau", phone: "0733 112 089", city: "Lavington", total_orders: 6, total_spent: 22200, last_order_at: "2026-07-17" },
];

export const WHATSAPP_CONVERSATIONS: WhatsAppConversation[] = [
  { id: "w1", customer_name: "Amina Wanjiru", wa_phone: "254712344512", status: "open", last_message: "Is the marble dress still in stock?", last_message_at: "2026-08-16T08:12:00Z", unread_count: 2 },
  { id: "w2", customer_name: "Peter Kiptoo", wa_phone: "254798112233", status: "bot", last_message: "hi", last_message_at: "2026-08-16T07:40:00Z", unread_count: 1 },
  { id: "w3", customer_name: "Cynthia Mwangi", wa_phone: "254723891004", status: "resolved", last_message: "Thank you so much! 🌟", last_message_at: "2026-08-15T18:05:00Z", unread_count: 0 },
  { id: "w4", customer_name: "+254 711 220 998", wa_phone: "254711220998", status: "open", last_message: "How much is delivery to Nakuru?", last_message_at: "2026-08-15T14:22:00Z", unread_count: 1 },
];

export const WHATSAPP_MESSAGES: Record<string, WhatsAppMessage[]> = {
  w1: [
    { id: "m1", conversation_id: "w1", direction: "inbound", content: "Hi! Is the marble dress still in stock?", is_bot: false, created_at: "2026-08-16T08:10:00Z", status: "read" },
    { id: "m2", conversation_id: "w1", direction: "outbound", content: "Hello Amina! Yes, the Marble Print Midi Dress is in stock — KES 1,500. Would you like me to place an order for you?", is_bot: false, created_at: "2026-08-16T08:11:00Z", status: "read" },
    { id: "m3", conversation_id: "w1", direction: "inbound", content: "Yes please, size M", is_bot: false, created_at: "2026-08-16T08:12:00Z", status: "delivered" },
  ],
  w2: [
    { id: "m4", conversation_id: "w2", direction: "inbound", content: "hi", is_bot: false, created_at: "2026-08-16T07:40:00Z", status: "read" },
    { id: "m5", conversation_id: "w2", direction: "outbound", content: "Hello! 👋 Welcome to Styled.ke — Nairobi's home for accessible luxury. All clothing is KES 1,500! How can I help — Shop, Prices, Delivery, or Location?", is_bot: true, created_at: "2026-08-16T07:40:05Z", status: "delivered" },
  ],
  w3: [
    { id: "m6", conversation_id: "w3", direction: "outbound", content: "Your order #SK-0090 has been delivered! Thank you for shopping with us 🌟", is_bot: false, created_at: "2026-08-15T18:00:00Z", status: "read" },
    { id: "m7", conversation_id: "w3", direction: "inbound", content: "Thank you so much! 🌟", is_bot: false, created_at: "2026-08-15T18:05:00Z", status: "read" },
  ],
  w4: [
    { id: "m8", conversation_id: "w4", direction: "inbound", content: "How much is delivery to Nakuru?", is_bot: false, created_at: "2026-08-15T14:22:00Z", status: "delivered" },
  ],
};

export const AUTOMATION_FLOWS: AutomationFlow[] = [
  { id: "af1", name: "Greeting", trigger_keyword: "hi, hello, hey", response_type: "button", response_content: "Hello! 👋 Welcome to Styled.ke. All clothing is KES 1,500! How can I help — Shop, Prices, Delivery, or Location?", is_active: true, trigger_count: 412 },
  { id: "af2", name: "Catalogue", trigger_keyword: "catalogue, shop, products", response_type: "list", response_content: "Browse our full catalogue: styled.ke/shop — dresses, tops and more, all KES 1,500.", is_active: true, trigger_count: 268 },
  { id: "af3", name: "Price", trigger_keyword: "price, how much", response_type: "text", response_content: "All clothing at Styled.ke is KES 1,500! Visit styled.ke for the full range.", is_active: true, trigger_count: 351 },
  { id: "af4", name: "Order", trigger_keyword: "order, buy, want", response_type: "text", response_content: "Great! Please send me your name, the item you'd like, and your delivery address and I'll get it sorted.", is_active: true, trigger_count: 190 },
  { id: "af5", name: "Delivery", trigger_keyword: "delivery, ship", response_type: "text", response_content: "We deliver nationwide via rider, matatu, mtaani pickup (KES 140) or doorstep pickup (from KES 350). Most orders arrive in 1-3 business days.", is_active: true, trigger_count: 144 },
  { id: "af6", name: "Location", trigger_keyword: "location, where", response_type: "text", response_content: "We're based in Nairobi, Kenya. Message us for the exact boutique address and directions!", is_active: true, trigger_count: 77 },
  { id: "af7", name: "Hours", trigger_keyword: "hours, open, time", response_type: "text", response_content: "We're open Mon–Sat, 9am–7pm, and always open on WhatsApp!", is_active: true, trigger_count: 52 },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, limit);
}

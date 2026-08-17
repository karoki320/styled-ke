// Hand-authored Supabase Database type, mirroring supabase/migrations/0001_init.sql.
// Once the project is live, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
// and this file becomes redundant (keep the export name `Database` stable).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Shape required by @supabase/postgrest-js's GenericTable constraint —
// Row/Insert/Update need an index signature and a (possibly empty)
// Relationships array, or every query on the typed client collapses to
// `never` instead of inferring column types.
type Row<T> = {
  Row: T & Record<string, unknown>;
  Insert: Partial<T> & Record<string, unknown>;
  Update: Partial<T> & Record<string, unknown>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      categories: Row<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image_url: string | null;
        display_order: number;
        is_active: boolean;
        created_at: string;
      }>;
      products: Row<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        category_id: string | null;
        price: number;
        compare_price: number | null;
        stock_quantity: number;
        low_stock_threshold: number;
        badge: string | null;
        is_active: boolean;
        is_featured: boolean;
        sku: string | null;
        weight_grams: number | null;
        meta_title: string | null;
        meta_description: string | null;
        created_at: string;
        updated_at: string;
      }>;
      product_images: Row<{
        id: string;
        product_id: string;
        image_url: string;
        alt_text: string | null;
        display_order: number;
        is_primary: boolean;
        created_at: string;
      }>;
      product_variants: Row<{
        id: string;
        product_id: string;
        name: string;
        image_url: string | null;
        stock_quantity: number;
        price_modifier: number;
        created_at: string;
      }>;
      customers: Row<{
        id: string;
        user_id: string | null;
        full_name: string;
        email: string | null;
        phone: string;
        whatsapp_phone: string | null;
        address_line1: string | null;
        address_line2: string | null;
        city: string;
        notes: string | null;
        total_orders: number;
        total_spent: number;
        created_at: string;
        updated_at: string;
      }>;
      delivery_zones: Row<{
        id: string;
        name: string;
        fee: number;
        is_active: boolean;
        display_order: number;
        created_at: string;
      }>;
      orders: Row<{
        id: string;
        order_number: string;
        customer_id: string | null;
        status: string;
        source: string;
        subtotal: number;
        delivery_fee: number;
        total: number;
        delivery_method: string | null;
        delivery_address: string | null;
        delivery_city: string | null;
        delivery_zone: string | null;
        delivery_agent: string | null;
        delivery_notes: string | null;
        payment_method: string | null;
        payment_status: string;
        paystack_reference: string | null;
        mpesa_reference: string | null;
        paid_at: string | null;
        confirmed_at: string | null;
        shipped_at: string | null;
        delivered_at: string | null;
        created_at: string;
        updated_at: string;
      }>;
      order_items: Row<{
        id: string;
        order_id: string;
        product_id: string | null;
        variant_id: string | null;
        product_name: string;
        variant_name: string | null;
        unit_price: number;
        quantity: number;
        subtotal: number;
        created_at: string;
      }>;
      pos_sessions: Row<{
        id: string;
        opened_by: string | null;
        opened_at: string;
        closed_at: string | null;
        opening_float: number;
        cash_sales: number;
        mpesa_sales: number;
        card_sales: number;
        total_sales: number;
        transaction_count: number;
        status: string;
      }>;
      whatsapp_conversations: Row<{
        id: string;
        customer_id: string | null;
        wa_phone: string;
        wa_contact_name: string | null;
        status: string;
        assigned_to: string | null;
        last_message_at: string | null;
        unread_count: number;
        created_at: string;
      }>;
      whatsapp_messages: Row<{
        id: string;
        conversation_id: string;
        wa_message_id: string | null;
        direction: string;
        message_type: string;
        content: string | null;
        media_url: string | null;
        template_name: string | null;
        status: string;
        is_bot: boolean;
        created_at: string;
      }>;
      whatsapp_templates: Row<{
        id: string;
        name: string;
        trigger: string | null;
        content: string;
        variables: string[] | null;
        is_active: boolean;
        created_at: string;
      }>;
      automation_flows: Row<{
        id: string;
        name: string;
        trigger_keyword: string | null;
        response_type: string | null;
        response_content: string | null;
        is_active: boolean;
        trigger_count: number;
        created_at: string;
      }>;
      analytics_events: Row<{
        id: string;
        event_type: string;
        product_id: string | null;
        order_id: string | null;
        session_id: string | null;
        created_at: string;
      }>;
      profiles: Row<{
        id: string;
        full_name: string | null;
        is_admin: boolean;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

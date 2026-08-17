import type { OrderStatus } from "@/types";

export const STATUS_COLORS: Record<OrderStatus, string> = {
  delivered: "#27ae60",
  shipped: "#2980b9",
  processing: "#f39c12",
  confirmed: "#2980b9",
  pending: "#e74c3c",
  cancelled: "#888888",
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="px-2 py-1 text-[0.58rem] font-bold uppercase tracking-wide"
      style={{ background: `${color}18`, color }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

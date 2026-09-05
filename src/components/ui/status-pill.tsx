import { Badge } from "@/components/ui/badge";

const STATUS_TONE: Record<string, "neutral" | "brand" | "success" | "warning" | "danger"> = {
  INQUIRY: "neutral",
  QUOTE: "neutral",
  PENDING: "warning",
  PAYMENT_REQUIRED: "warning",
  PARTIALLY_PAID: "warning",
  CONFIRMED: "success",
  TRAVEL_IN_PROGRESS: "brand",
  COMPLETED: "success",
  CANCELLED: "danger",
  REFUND_REQUESTED: "danger",
  REFUNDED: "neutral",
  EXPIRED: "neutral",
};

export function BookingStatusPill({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{status.replaceAll("_", " ")}</Badge>;
}

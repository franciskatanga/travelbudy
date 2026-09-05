import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

/** Generates a unique booking reference in the format TRV-YYYY-NNNNNN. */
export async function generateBookingReference(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.booking.count({
    where: { reference: { startsWith: `TRV-${year}-` } },
  });
  const sequence = String(count + 1).padStart(6, "0");
  return `TRV-${year}-${sequence}`;
}

/**
 * Controlled booking state machine. Only listed transitions are allowed —
 * every transition is recorded as a BookingStatusEvent for a full audit
 * timeline.
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  INQUIRY: ["QUOTE", "CANCELLED", "EXPIRED"],
  QUOTE: ["PENDING", "CANCELLED", "EXPIRED"],
  PENDING: ["PAYMENT_REQUIRED", "CANCELLED", "EXPIRED"],
  PAYMENT_REQUIRED: ["PARTIALLY_PAID", "CONFIRMED", "CANCELLED", "EXPIRED"],
  PARTIALLY_PAID: ["CONFIRMED", "CANCELLED", "REFUND_REQUESTED"],
  CONFIRMED: ["TRAVEL_IN_PROGRESS", "CANCELLED", "REFUND_REQUESTED"],
  TRAVEL_IN_PROGRESS: ["COMPLETED", "REFUND_REQUESTED"],
  COMPLETED: ["REFUND_REQUESTED"],
  CANCELLED: ["REFUNDED"],
  REFUND_REQUESTED: ["REFUNDED", "CONFIRMED"],
  REFUNDED: [],
  EXPIRED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionBooking(bookingId: string, to: BookingStatus, note?: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  if (!canTransition(booking.status, to)) {
    throw new Error(`Invalid booking transition: ${booking.status} -> ${to}`);
  }
  return prisma.$transaction([
    prisma.booking.update({ where: { id: bookingId }, data: { status: to } }),
    prisma.bookingStatusEvent.create({ data: { bookingId, status: to, note } }),
  ]);
}

import { useMutation } from "@tanstack/react-query";
import type { BookingPayload, Booking } from "@/lib/types";
import { toast } from "sonner";

let bookingApiWarmed = false;

export type VoucherType = "PERCENT" | "FIXED";

export type VoucherValidation = {
  voucherId: string;
  code: string;
  type: VoucherType;
  value: number;
  discountAmount: number;
  finalPrice: number;
};

export type VoucherOption = {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
};

export type PublicDayOff = {
  date: string;
  reason: string | null;
};

export async function warmupBookingApi(): Promise<void> {
  if (bookingApiWarmed) return;
  try {
    // Warm the backend process after page refresh so first booking submit is faster.
    await fetch("/api/v1/services", { method: "GET" });
  } catch {
    // Ignore warmup failures; actual booking submit will surface real errors.
  } finally {
    bookingApiWarmed = true;
  }
}

export async function validateVoucherApi(
  code: string,
  totalPrice: number,
): Promise<VoucherValidation> {
  const res = await fetch("/api/v1/vouchers/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, orderValue: totalPrice }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Mã voucher không hợp lệ");
  }
  const json = await res.json();
  return json.data;
}

export async function listActiveVouchersApi(): Promise<VoucherOption[]> {
  const params = new URLSearchParams({ isActive: "true", limit: "100" });
  const res = await fetch(`/api/v1/vouchers?${params}`, {
    method: "GET",
  });

  // This endpoint may be protected depending on backend config.
  if (!res.ok) return [];

  const json = await res.json().catch(() => ({ data: [] }));
  return Array.isArray(json.data) ? json.data : [];
}

export async function listPublicDayOffsApi(
  from: string,
  to: string,
): Promise<PublicDayOff[]> {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/v1/bookings/day-offs?${params.toString()}`, {
    method: "GET",
  });

  if (!res.ok) return [];

  const json = await res.json().catch(() => ({ data: [] }));
  return Array.isArray(json.data) ? json.data : [];
}

async function createBookingApi(payload: BookingPayload): Promise<Booking> {

  const dateObj = new Date(payload.date);
  const [hours, minutes] = payload.time.split(":").map(Number);
  dateObj.setHours(hours, minutes, 0, 0);

  const body: Record<string, unknown> = {
    serviceId: payload.service.id,
    startTime: dateObj.toISOString(),
    customerName: payload.customer.name,
    customerPhone: payload.customer.phone,
    customerEmail: payload.customer.email,
  };

  if (payload.note) body.notes = payload.note;
  if (payload.staffId && payload.staffId !== "any") body.staffId = payload.staffId;
  if (payload.voucherCode?.trim()) body.voucherCode = payload.voucherCode.trim().toUpperCase();

  const res = await fetch("/api/v1/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    throw new Error("This time slot is already booked. Please choose a different time.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Booking failed (${res.status})`);
  }

  const json = await res.json();
  const data = json.data ?? json;
  return {
    ...payload,
    id: data.id ?? crypto.randomUUID(),
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? new Date().toISOString(),
    totalPrice: data.totalPrice,
    discountAmount: data.discountAmount,
    finalPrice: data.finalPrice,
    voucherId: data.voucherId,
  };
}

export function useCreateBooking() {
  return useMutation<Booking, Error, BookingPayload>({
    mutationFn: createBookingApi,
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to book appointment");
    },
  });
}


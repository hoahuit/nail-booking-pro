import { useMutation } from "@tanstack/react-query";
import type { MultiServiceBookingPayload, Booking } from "@/lib/types";
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

// ── Duration helpers ──────────────────────────────────────────────────────────

/** Parse "45m", "1h", "1h 30m", "1h30m" → total minutes */
function parseDurationMinutes(duration: string): number {
  const hourMatch = duration.match(/(\d+)\s*h/);
  const minMatch = duration.match(/(\d+)\s*m/);
  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  return hours * 60 + mins;
}

/** Add minutes to a "HH:mm" string → "HH:mm" */
function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

async function createBookingApi(
  payload: MultiServiceBookingPayload,
): Promise<Booking> {
  // Build sequential start times for each service entry
  let currentTime = payload.time;
  const servicesBody = payload.services.map((entry) => {
    const dateObj = new Date(payload.date);
    const [hours, minutes] = currentTime.split(":").map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    const startTime = dateObj.toISOString();

    currentTime = addMinutesToTime(
      currentTime,
      parseDurationMinutes(entry.service.duration),
    );

    return {
      serviceId: entry.service.id,
      startTime,
      ...(entry.staffId !== "any" ? { staffId: entry.staffId } : {}),
    };
  });

  let res: Response;

  if (payload.designImage) {
    // multipart/form-data when design image is attached
    const formData = new FormData();
    formData.append("services", JSON.stringify(servicesBody));
    formData.append("customerName", payload.customer.name);
    formData.append("customerPhone", payload.customer.phone);
    if (payload.customer.email) {
      formData.append("customerEmail", payload.customer.email);
    }
    if (payload.note) formData.append("notes", payload.note);
    if (payload.voucherCode?.trim()) {
      formData.append(
        "voucherCode",
        payload.voucherCode.trim().toUpperCase(),
      );
    }
    formData.append("designImage", payload.designImage);

    res = await fetch("/api/v1/bookings", { method: "POST", body: formData });
  } else {
    const body: Record<string, unknown> = {
      services: servicesBody,
      customerName: payload.customer.name,
      customerPhone: payload.customer.phone,
    };
    if (payload.customer.email) body.customerEmail = payload.customer.email;
    if (payload.note) body.notes = payload.note;
    if (payload.voucherCode?.trim()) {
      body.voucherCode = payload.voucherCode.trim().toUpperCase();
    }

    res = await fetch("/api/v1/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  if (res.status === 409) {
    throw new Error(
      "This time slot is already booked. Please choose a different time.",
    );
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `Booking failed (${res.status})`,
    );
  }

  const json = await res.json();
  const data = (json.data ?? json) as Record<string, unknown>;
  return {
    id: (data.id as string | undefined) ?? crypto.randomUUID(),
    status: (data.status as Booking["status"] | undefined) ?? "pending",
    createdAt: (data.createdAt as string | undefined) ?? new Date().toISOString(),
    totalPrice: data.totalPrice as number | undefined,
    discountAmount: data.discountAmount as number | undefined,
    finalPrice: data.finalPrice as number | undefined,
    voucherId: data.voucherId as string | undefined,
  };
}

export function useCreateBooking() {
  return useMutation<Booking, Error, MultiServiceBookingPayload>({
    mutationFn: createBookingApi,
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to book appointment");
    },
  });
}


import { useMutation } from "@tanstack/react-query";
import type { BookingPayload, Booking } from "@/lib/types";
import { toast } from "sonner";

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
  // Normalise backend response to match our Booking type
  return {
    ...payload,
    id: json.data?.id ?? json.id ?? crypto.randomUUID(),
    status: json.data?.status ?? "pending",
    createdAt: json.data?.createdAt ?? new Date().toISOString(),
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


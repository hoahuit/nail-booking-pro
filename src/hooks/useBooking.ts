import { useMutation } from "@tanstack/react-query";
import type { BookingPayload, Booking } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook to submit a booking.
 * Currently simulates success — replace mutationFn with actual API call.
 *
 * Example:
 *   mutationFn: (payload) => fetch("/api/bookings", { method: "POST", body: JSON.stringify(payload) }).then(r => r.json())
 */
export function useCreateBooking() {
  return useMutation<Booking, Error, BookingPayload>({
    mutationFn: async (payload) => {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 600));

      // Return mock booking
      return {
        ...payload,
        id: crypto.randomUUID(),
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to book appointment");
    },
  });
}

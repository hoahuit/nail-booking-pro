import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiBooking, BookingStatus } from "@/lib/adminTypes";
import { getToken } from "@/hooks/useAuth";

function adminHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface BookingFilters {
  status?: BookingStatus | "ALL";
  date?: string;       // YYYY-MM-DD
  staffId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ApiListResponse {
  success: boolean;
  data: ApiBooking[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

async function fetchBookings(filters: BookingFilters): Promise<ApiListResponse> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
  if (filters.date) params.set("date", filters.date);
  if (filters.staffId) params.set("staffId", filters.staffId);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  params.set("orderBy", "createdAt");
  params.set("order", "desc");

  const res = await fetch(`/api/v1/bookings?${params.toString()}`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch bookings (${res.status})`);
  const json: ApiListResponse = await res.json();
  // Sort client-side by createdAt descending to guarantee newest-first
  json.data = json.data.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return json;
}

async function fetchBookingById(id: string): Promise<ApiBooking> {
  const res = await fetch(`/api/v1/bookings/${id}`, { headers: adminHeaders() });
  if (!res.ok) throw new Error(`Booking not found (${res.status})`);
  const json = await res.json();
  return json.data;
}

async function patchStatus(id: string, status: BookingStatus): Promise<ApiBooking> {
  const res = await fetch(`/api/v1/bookings/${id}/status`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Update failed (${res.status})`);
  }
  const json = await res.json();
  return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminBookings(filters: BookingFilters) {
  return useQuery<ApiListResponse>({
    queryKey: ["admin-bookings", filters],
    queryFn: () => fetchBookings(filters),
    staleTime: 30_000,
  });
}

export function useBookingDetail(id: string | null) {
  return useQuery<ApiBooking>({
    queryKey: ["admin-booking", id],
    queryFn: () => fetchBookingById(id!),
    enabled: !!id,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation<ApiBooking, Error, { id: string; status: BookingStatus }>({
    mutationFn: ({ id, status }) => patchStatus(id, status),
    onSuccess: (updated) => {
      toast.success(`Trạng thái đã cập nhật: ${updated.status}`);
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-booking", updated.id] });
    },
    onError: (err) => {
      toast.error(err.message || "Cập nhật thất bại");
    },
  });
}

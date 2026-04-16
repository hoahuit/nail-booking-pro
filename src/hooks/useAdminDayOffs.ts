import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getToken } from "@/hooks/useAuth";
import type { ApiDayOff } from "@/lib/adminTypes";

function adminHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface DayOffPayload {
  date: string;
  reason?: string | null;
}

async function fetchAdminDayOffs(): Promise<ApiDayOff[]> {
  const res = await fetch("/api/v1/admin/day-offs", {
    headers: adminHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch day-offs (${res.status})`);
  }

  const json = await res.json().catch(() => ({ data: [] }));
  const data = Array.isArray(json.data) ? json.data : [];

  return data
    .filter((item) => item?.id && item?.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function upsertDayOff(payload: DayOffPayload): Promise<ApiDayOff> {
  const res = await fetch("/api/v1/admin/day-offs", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to save day-off (${res.status})`);
  }

  const json = await res.json().catch(() => ({}));
  return json.data ?? json;
}

async function removeDayOff(id: string): Promise<void> {
  const res = await fetch(`/api/v1/admin/day-offs/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete day-off (${res.status})`);
  }
}

export function useAdminDayOffs() {
  return useQuery<ApiDayOff[]>({
    queryKey: ["admin-day-offs"],
    queryFn: fetchAdminDayOffs,
    staleTime: 30_000,
  });
}

export function useUpsertDayOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertDayOff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-day-offs"] });
      toast.success("Đã lưu ngày nghỉ");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Lưu ngày nghỉ thất bại");
    },
  });
}

export function useDeleteDayOff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeDayOff,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-day-offs"] });
      toast.success("Đã xóa ngày nghỉ");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Xóa ngày nghỉ thất bại");
    },
  });
}

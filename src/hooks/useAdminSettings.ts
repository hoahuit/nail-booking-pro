import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getToken } from "@/hooks/useAuth";

function adminHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface AdminSettingsData {
  settings: Array<{ key: string; value: string }>;
  maxBookingsPerSlot: number;
}

interface AdminSettingsResponse {
  success: boolean;
  data: AdminSettingsData;
}

async function fetchAdminSettings(): Promise<AdminSettingsData> {
  const res = await fetch("/api/v1/admin/settings", {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Khong tai duoc cau hinh");
  const json: AdminSettingsResponse = await res.json();
  return json.data;
}

async function updateAdminSettings(payload: {
  maxBookingsPerSlot: number;
}): Promise<AdminSettingsData> {
  const res = await fetch("/api/v1/admin/settings", {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "Cap nhat cau hinh that bai");
  }
  return json.data as AdminSettingsData;
}

export function useAdminSettings() {
  return useQuery<AdminSettingsData>({
    queryKey: ["admin-settings"],
    queryFn: fetchAdminSettings,
    staleTime: 30_000,
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: () => {
      toast.success("Da cap nhat cau hinh");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Cap nhat cau hinh that bai");
    },
  });
}

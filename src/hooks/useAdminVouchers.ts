import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getToken } from "@/hooks/useAuth";

function adminHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type VoucherType = "PERCENT" | "FIXED";

export interface ApiVoucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherCreatePayload {
  code: string;
  type: VoucherType;
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

export interface VoucherUpdatePayload {
  isActive?: boolean;
  maxUses?: number;
  expiresAt?: string | null;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchVouchers(isActive?: boolean): Promise<ApiVoucher[]> {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.set("isActive", String(isActive));
  params.set("limit", "100");

  const res = await fetch(`/api/v1/admin/vouchers?${params}`, {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch vouchers");
  const json = await res.json();
  return json.data;
}

async function createVoucher(payload: VoucherCreatePayload): Promise<ApiVoucher> {
  const res = await fetch("/api/v1/admin/vouchers", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create voucher");
  }
  const json = await res.json();
  return json.data;
}

async function updateVoucher(id: string, payload: VoucherUpdatePayload): Promise<ApiVoucher> {
  const res = await fetch(`/api/v1/admin/vouchers/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update voucher");
  }
  const json = await res.json();
  return json.data;
}

async function deleteVoucher(id: string): Promise<void> {
  const res = await fetch(`/api/v1/admin/vouchers/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete voucher");
  }
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminVouchers(isActive?: boolean) {
  return useQuery<ApiVoucher[]>({
    queryKey: ["admin-vouchers", isActive],
    queryFn: () => fetchVouchers(isActive),
  });
}

export function useCreateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success("Voucher đã được tạo");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VoucherUpdatePayload }) =>
      updateVoucher(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success("Đã cập nhật voucher");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteVoucher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVoucher,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-vouchers"] });
      toast.success("Đã xóa voucher");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

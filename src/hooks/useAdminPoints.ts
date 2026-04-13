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

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PointHistoryEntry {
  points: number;
  type: "EARN" | "ADJUST" | "REDEEM";
  amountSpent: number | null;
  note: string | null;
  createdAt: string;
}

export interface LoyaltyAccount {
  id: string;
  phone: string;
  customerName: string | null;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAccountDetail extends LoyaltyAccount {
  history: PointHistoryEntry[];
}

interface ListAccountsResponse {
  data: LoyaltyAccount[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── API helpers ────────────────────────────────────────────────────────────────

export async function lookupByPhone(phone: string): Promise<LoyaltyAccountDetail> {
  const res = await fetch(`/api/v1/admin/loyalty/lookup?phone=${encodeURIComponent(phone)}`, {
    headers: adminHeaders(),
  });
  if (res.status === 404) throw Object.assign(new Error("NOT_FOUND"), { status: 404 });
  if (!res.ok) throw new Error("Lookup failed");
  const json = await res.json();
  return json.data;
}

async function addPointsApi(payload: {
  phone: string;
  customerName?: string;
  amountSpent: number;
  note?: string;
}) {
  const res = await fetch("/api/v1/admin/loyalty/add-points", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Thêm điểm thất bại");
  return json.data as { phone: string; customerName: string | null; pointsEarned: number; totalPoints: number };
}

async function adjustPointsApi(payload: { phone: string; points: number; note: string }) {
  const res = await fetch("/api/v1/admin/loyalty/adjust", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Điều chỉnh điểm thất bại");
  return json.data as { phone: string; customerName: string | null; adjustment: number; totalPoints: number };
}

async function fetchAccounts(search: string, page: number, limit: number): Promise<ListAccountsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  const res = await fetch(`/api/v1/admin/loyalty?${params}`, { headers: adminHeaders() });
  if (!res.ok) throw new Error("Không tải được danh sách");
  return res.json();
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useLoyaltyAccounts(search: string, page: number, limit = 20) {
  return useQuery<ListAccountsResponse>({
    queryKey: ["loyalty-accounts", search, page, limit],
    queryFn: () => fetchAccounts(search, page, limit),
    staleTime: 30_000,
  });
}

export function useAddPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addPointsApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-accounts"] }),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdjustPoints() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adjustPointsApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["loyalty-accounts"] }),
    onError: (err: Error) => toast.error(err.message),
  });
}

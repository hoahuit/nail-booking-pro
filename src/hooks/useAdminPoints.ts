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
  staffName?: string | null;
  note: string | null;
  createdAt: string;
}

export interface LoyaltyRewardRule {
  id: string;
  thresholdPoints: number;
  rewardType: "FIXED" | "PERCENT";
  rewardValue: number;
  isActive?: boolean;
}

export interface RewardRulePayload {
  thresholdPoints: number;
  rewardType: "FIXED" | "PERCENT";
  rewardValue: number;
  isActive?: boolean;
}

export interface RewardRuleUpdatePayload {
  thresholdPoints?: number;
  rewardType?: "FIXED" | "PERCENT";
  rewardValue?: number;
  isActive?: boolean;
}

export interface LoyaltySettings {
  id: string;
  code: string;
  pointsPerVisit: number;
  rewardRules: LoyaltyRewardRule[];
}

export interface LoyaltyAccount {
  id: string;
  phone: string;
  customerName: string | null;
  totalPoints: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAccountDetail extends LoyaltyAccount {
  history: PointHistoryEntry[];
  eligibleRewards: LoyaltyRewardRule[];
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
  staffName?: string;
  amountSpent?: number;
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

async function adjustPointsApi(payload: {
  phone: string;
  points: number;
  note: string;
  staffName?: string;
}) {
  const res = await fetch("/api/v1/admin/loyalty/adjust", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Điều chỉnh điểm thất bại");
  return json.data as { phone: string; customerName: string | null; adjustment: number; totalPoints: number };
}

async function fetchLoyaltySettings(): Promise<LoyaltySettings> {
  const res = await fetch("/api/v1/admin/loyalty/settings", {
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Không tải được cấu hình tích điểm");
  const json = await res.json();
  return json.data;
}

async function updateLoyaltySettings(payload: {
  pointsPerVisit: number;
}): Promise<LoyaltySettings> {
  const res = await fetch("/api/v1/admin/loyalty/settings", {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Cập nhật cấu hình thất bại");
  return json.data;
}

async function createRewardRuleApi(
  payload: RewardRulePayload,
): Promise<LoyaltyRewardRule> {
  const res = await fetch("/api/v1/admin/loyalty/reward-rules", {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Tạo rule thất bại");
  return json.data;
}

async function updateRewardRuleApi({
  id,
  payload,
}: {
  id: string;
  payload: RewardRuleUpdatePayload;
}): Promise<LoyaltyRewardRule> {
  const res = await fetch(`/api/v1/admin/loyalty/reward-rules/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Cập nhật rule thất bại");
  return json.data;
}

async function deleteRewardRuleApi(id: string): Promise<void> {
  const res = await fetch(`/api/v1/admin/loyalty/reward-rules/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Xóa rule thất bại");
}

async function deactivateLoyaltyAccountApi(
  phone: string,
): Promise<{ message: string }> {
  const res = await fetch(
    `/api/v1/admin/loyalty/accounts/${encodeURIComponent(phone)}`,
    {
      method: "DELETE",
      headers: adminHeaders(),
    },
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || "Khóa tài khoản thất bại");
  }
  return { message: json.message || "Đã khóa tài khoản loyalty" };
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

export function useLoyaltySettings() {
  return useQuery<LoyaltySettings>({
    queryKey: ["loyalty-settings"],
    queryFn: fetchLoyaltySettings,
    staleTime: 30_000,
  });
}

export function useUpdateLoyaltySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateLoyaltySettings,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loyalty-settings"] });
      toast.success("Đã cập nhật cấu hình tích điểm");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateRewardRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRewardRuleApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loyalty-settings"] });
      toast.success("Đã tạo điều kiện giảm giá");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateRewardRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateRewardRuleApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loyalty-settings"] });
      toast.success("Đã cập nhật điều kiện giảm giá");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteRewardRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRewardRuleApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loyalty-settings"] });
      toast.success("Đã xóa điều kiện giảm giá");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeactivateLoyaltyAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateLoyaltyAccountApi,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["loyalty-accounts"] });
      toast.success(data.message || "Đã khóa tài khoản loyalty");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

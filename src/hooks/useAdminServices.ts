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

export interface ApiService {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  duration: number;
  price: string; // Decimal comes as string from Prisma JSON
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ServicePayload {
  name: string;
  description?: string;
  image?: string;
  duration: number;
  price: number;
  category: string;
  isActive?: boolean;
}

interface ApiListResponse {
  success: boolean;
  data: ApiService[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchServices(filters: ServiceFilters): Promise<ApiListResponse> {
  const params = new URLSearchParams();
  if (filters.search)              params.set("search", filters.search);
  if (filters.category)            params.set("category", filters.category);
  if (filters.isActive !== undefined) params.set("isActive", String(filters.isActive));
  params.set("page",  String(filters.page  ?? 1));
  params.set("limit", String(filters.limit ?? 20));
  // Show all (active + inactive) in admin
  if (filters.isActive === undefined) params.set("isActive", "false"); // override: backend default is true-only

  const res = await fetch(`/api/v1/services?${params}`, { headers: adminHeaders() });
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

async function fetchCategories(): Promise<string[]> {
  const res = await fetch("/api/v1/services/categories", { headers: adminHeaders() });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const json = await res.json();
  return json.data;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useAdminServices(filters: ServiceFilters = {}) {
  return useQuery({
    queryKey: ["admin-services", filters],
    queryFn: () => fetchServices(filters),
    staleTime: 30_000,
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

export function useCreateService() {
    debugger
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ServicePayload) => {
      const res = await fetch("/api/v1/services", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to create service");
      return json.data as ApiService;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["service-categories"] });
      toast.success("Đã tạo dịch vụ mới");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<ServicePayload> }) => {
      const res = await fetch(`/api/v1/services/${id}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to update service");
      return json.data as ApiService;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Đã cập nhật dịch vụ");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUploadServiceImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const token = getToken();
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/v1/upload/service-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Upload ảnh thất bại");
      const url: string = json.url;
      try {
        return new URL(url).pathname;
      } catch {
        return url; 
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/services/${id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      if (!res.ok) throw new Error("Failed to deactivate service");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Đã ẩn dịch vụ");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

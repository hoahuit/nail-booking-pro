import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function apiLogin(email: string, password: string) {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (res.status === 401 || !json.success) {
    throw new Error(json.message || "Email hoặc mật khẩu không đúng");
  }
  if (!res.ok) {
    throw new Error(json.message || `Đăng nhập thất bại (${res.status})`);
  }

  return json.data as { user: AdminUser; token: string };
}

async function apiMe(): Promise<AdminUser> {
  const res = await fetch("/api/v1/auth/me", {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Unauthorized");
  const json = await res.json();
  return json.data;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Returns current logged-in admin user, or null if not authenticated */
export function useAdminUser() {
  return useQuery<AdminUser | null>({
    queryKey: ["admin-me"],
    queryFn: async () => {
      if (!getToken()) return null;
      try {
        return await apiMe();
      } catch {
        clearToken();
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<{ user: AdminUser; token: string }, Error, { email: string; password: string }>({
    mutationFn: ({ email, password }) => apiLogin(email, password),
    onSuccess: ({ user, token }) => {
      setToken(token);
      queryClient.setQueryData(["admin-me"], user);
      toast.success(`Chào mừng trở lại, ${user.name}!`);
    },
    onError: (err) => {
      toast.error(err.message || "Đăng nhập thất bại");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    clearToken();
    queryClient.setQueryData(["admin-me"], null);
    queryClient.clear();
  };
}

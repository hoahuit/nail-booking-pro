import { useQuery } from "@tanstack/react-query";
import { POPULAR_SERVICES } from "@/lib/data/services";
import type { ServiceCategory, ServiceItem } from "@/lib/types";

const BACKEND = "http://localhost:4000";
function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BACKEND}${path}`;
}

interface ApiService {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: number;
  price: string;
  category: string;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: ApiService[];
}

async function fetchServices(): Promise<ServiceCategory[]> {
  const res = await fetch("/api/v1/services");
  if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`);
  const json: ApiResponse = await res.json();
  if (!json.success) throw new Error("API returned success=false");

  // Group flat list into ServiceCategory[] keyed by category
  const categoryMap = new Map<string, ServiceItem[]>();
  for (const svc of json.data) {
    if (!svc.isActive) continue;
    const key = svc.category.toLowerCase().replace(/\s+/g, "-");
    if (!categoryMap.has(key)) categoryMap.set(key, []);
    categoryMap.get(key)!.push({
      id: svc.id,
      name: svc.name,
      price: `$${svc.price}`,
      duration: `${svc.duration}m`,
      image: resolveImageUrl(svc.image),
      categoryKey: key,
    });
  }

  return Array.from(categoryMap.entries()).map(([key, items]) => ({
    key,
    label: items[0]?.categoryKey
      ? svc_label(key)
      : key.toUpperCase(),
    items,
  }));
}

function svc_label(key: string) {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function useServices() {
  return useQuery<ServiceCategory[]>({
    queryKey: ["services"],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIsPopular(name: string) {
  return POPULAR_SERVICES.has(name);
}

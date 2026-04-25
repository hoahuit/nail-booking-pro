import { useQuery } from "@tanstack/react-query";
import { POPULAR_SERVICES } from "@/lib/data/services";
import type { ServiceCategory, ServiceItem } from "@/lib/types";
import { resolveAssetUrl } from "@/lib/assetUrl";

interface ApiService {
  id: string;
  name: string;
  description: string;
  image: string;
  duration: number;
  price: string;
  priceMax: string | null;
  category: string;
  isActive: boolean;
}

interface ApiResponse {
  success: boolean;
  data: ApiService[];
}

async function fetchServices(): Promise<ServiceCategory[]> {
  const res = await fetch("/api/v1/services?limit=90");
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
      price: `${svc.price}£`,      priceMax: svc.priceMax ? `£${svc.priceMax}` : null,      duration: `${svc.duration}m`,
      image: resolveAssetUrl(svc.image),
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

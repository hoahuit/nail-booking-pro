import { useQuery } from "@tanstack/react-query";
import { SERVICE_CATEGORIES, POPULAR_SERVICES } from "@/lib/data/services";
import type { ServiceCategory } from "@/lib/types";

/**
 * Hook to fetch service categories.
 * Currently returns static data — swap the queryFn for an API call when backend is ready.
 *
 * Example future implementation:
 *   queryFn: () => fetch("/api/services").then(r => r.json())
 */
export function useServices() {
  return useQuery<ServiceCategory[]>({
    queryKey: ["services"],
    queryFn: async () => SERVICE_CATEGORIES,
    staleTime: Infinity, // static data for now
  });
}

export function useIsPopular(name: string) {
  return POPULAR_SERVICES.has(name);
}

export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const configuredBase = (import.meta.env.VITE_ASSET_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return configuredBase ? `${configuredBase}${normalizedPath}` : normalizedPath;
}

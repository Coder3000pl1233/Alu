export const protectedOfflinePrefixes = ["/app/material/", "/demo-content/"] as const;

export function shouldNeverCache(pathname: string) {
  return protectedOfflinePrefixes.some(prefix => pathname.startsWith(prefix));
}

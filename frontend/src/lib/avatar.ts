/**
 * Helper to resolve avatar image URLs.
 * Converts relative backend paths like `/uploads/profile/...` to full backend URLs.
 */
export function getAvatarUrl(path?: string | null): string {
  if (!path) return "";
  
  // Return directly if already absolute URL or data URL
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${baseUrl.replace(/\/$/, "")}${cleanPath}`;
}

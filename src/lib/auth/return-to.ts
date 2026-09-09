const ALLOWED_RETURN_PATHS = new Set(["/dashboard"]);

/**
 * Restrict post-login redirects to known in-app paths.
 * Rejects open redirects such as //evil.com or https://evil.com.
 */
export function sanitizeReturnTo(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }

  const pathOnly = value.split("?")[0]?.split("#")[0] ?? fallback;
  if (ALLOWED_RETURN_PATHS.has(pathOnly)) {
    return pathOnly;
  }

  return fallback;
}

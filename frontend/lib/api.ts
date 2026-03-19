const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080";

export const AUTH_TOKEN_KEY = "ridemate_token";
export const AUTH_USER_KEY = "ridemate_user";

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (localToken) return localToken;

  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function setAuthSession(token: string, user?: unknown): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);

    if (user !== undefined) {
      const serializedUser = JSON.stringify(user);
      localStorage.setItem(AUTH_USER_KEY, serializedUser);
      sessionStorage.setItem(AUTH_USER_KEY, serializedUser);
    }
  } catch {
    // Ignore storage errors (private mode/quota) and keep app functional.
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // Ignore storage errors.
  }
}

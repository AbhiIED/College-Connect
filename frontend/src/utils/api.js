export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Helper function to resolve full image URLs returned by the backend (relative paths)
export const getImageUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
};

// ── Token helpers ───────────────────────────────────────
export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
};
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Parse a JWT payload to read its expiration timestamp.
 * Returns the exp value in seconds, or 0 on failure.
 */
function parseTokenExp(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp || 0;
  } catch {
    return 0;
  }
}

/**
 * Check if the current access token is expired or about to expire (< 60s left).
 */
function isTokenExpired(token) {
  if (!token) return true;
  const exp = parseTokenExp(token);
  return Date.now() >= (exp * 1000) - 60000; // 60-second buffer
}

/**
 * Attempt to refresh the access token using the httpOnly refresh cookie.
 * Returns the new token string on success, or null on failure (user must re-login).
 */
let refreshPromise = null; // Prevents multiple concurrent refresh calls
async function refreshAccessToken() {
  // If a refresh is already in-flight, return the same promise to avoid duplicates
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // sends the httpOnly cookie
      });
      if (!res.ok) {
        clearAuth();
        return null;
      }
      const data = await res.json();
      setToken(data.token);
      return data.token;
    } catch {
      clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Authenticated fetch wrapper that:
 *  1. Attaches the JWT access token as a Bearer header
 *  2. Auto-refreshes if the token is expired/about-to-expire
 *  3. Retries once on a 401 response (in case the token expired mid-flight)
 *  4. Redirects to /signin if refresh fails
 *
 * Usage:
 *   const res = await authFetch("/alumni");
 *   const res = await authFetch("/feeds", { method: "POST", body: formData });
 *
 * @param {string} url - Relative path (e.g. "/alumni") or full URL
 * @param {RequestInit} options - Standard fetch options
 * @returns {Promise<Response>}
 */
export async function authFetch(url, options = {}) {
  let token = getToken();

  // Pre-check: if token is expired, refresh before making the request
  if (isTokenExpired(token)) {
    token = await refreshAccessToken();
    if (!token) {
      // Refresh failed — redirect to signin
      window.location.href = "/signin";
      throw new Error("Session expired. Please sign in again.");
    }
  }

  // Build the full URL if a relative path is provided
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // Merge Authorization header into options
  const headers = { ...(options.headers || {}) };
  headers["Authorization"] = `Bearer ${token}`;

  // Don't override Content-Type if the body is FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", // always send cookies for refresh token
  });

  // If we get a 401, try refreshing once and retry
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      window.location.href = "/signin";
      throw new Error("Session expired. Please sign in again.");
    }

    headers["Authorization"] = `Bearer ${newToken}`;
    return fetch(fullUrl, {
      ...options,
      headers,
      credentials: "include",
    });
  }

  return res;
}

/**
 * Logout: calls the backend to clear the refresh cookie, then clears local storage.
 */
export async function logout() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // Best-effort — even if the call fails, clear local state
  }
  clearAuth();
  window.location.href = "/signin";
}

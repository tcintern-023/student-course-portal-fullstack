/**
 * Token Storage
 * ---------------
 * Wraps localStorage access so the rest of the app never has to worry
 * about server-side rendering (where `window` doesn't exist).
 */

const TOKEN_KEY = "student_course_portal_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

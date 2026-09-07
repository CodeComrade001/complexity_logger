// utils/sessionStorage.ts

const DEFAULT_SECRET = import.meta.env.VITE_SESSION_SECRET || "log-complexity-session-key";

export function storeSession<T>(
  key: string,
  data: T,
  secret: string = DEFAULT_SECRET
): void {
  try {
    const json = JSON.stringify(data);
    const encrypted = btoa(
      encodeURIComponent(json + secret)
    );
    sessionStorage.setItem(key, encrypted);
  } catch (err) {
    console.error("Failed to store session data", err);
  }
}


// utils/sessionStorage.ts

export function fetchSession<T>(
  key: string,
  secret: string = DEFAULT_SECRET
): T | null {
  try {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;

    const decoded = decodeURIComponent(atob(encrypted));
    const json = decoded.replace(secret, "");

    const seeJson = JSON.parse(json);

    return seeJson as T;
  } catch (err) {
    console.error("Failed to fetch session data", err);
    return null;
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("falah_os_token");
  if (!token) {
    window.location.assign("/");
    throw new Error("Your session has ended.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      "Accept-Language": localStorage.getItem("falah_os_language") || "en",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
  const result = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("falah_os_token");
      localStorage.removeItem("falah_os_client");
      window.location.assign("/");
    }
    throw new Error(result.message || "Something went wrong.");
  }

  return result.data as T;
}

export function formatCurrency(value: number, currency = "AED") {
  const locale = typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar-AE" : "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  const locale = typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar-AE" : "en-AE";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

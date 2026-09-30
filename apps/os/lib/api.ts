import { clearSession, getToken } from "./session";

// Production uses the same-origin /api proxy (see next.config.mjs).
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001/api")
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

interface Envelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

async function parse<T>(response: Response): Promise<Envelope<T>> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Envelope<T>;
  } catch {
    return { message: response.ok ? undefined : text.slice(0, 200) };
  }
}

function language() {
  try {
    return localStorage.getItem("falah_os_language") || "en";
  } catch {
    return "en";
  }
}

/** Unauthenticated request, used by the sign-in screen. */
export async function publicApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", "Accept-Language": language(), ...init.headers },
    });
  } catch {
    throw new ApiError("network", 0);
  }
  const result = await parse<T>(response);
  if (!response.ok) throw new ApiError(result.message || result.error || "generic", response.status);
  return result.data as T;
}

/** Authenticated request against the client's workspace. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) {
    window.location.assign("/");
    throw new ApiError("session", 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        "Accept-Language": language(),
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError("network", 0);
  }

  const result = await parse<T>(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      window.location.assign("/?expired=1");
    }
    throw new ApiError(result.message || result.error || "generic", response.status);
  }

  return result.data as T;
}

export const json = (body: unknown) => JSON.stringify(body);

/** Minutes, same sign as Date#getTimezoneOffset — lets the API bucket "today" correctly. */
export const tzOffset = () => new Date().getTimezoneOffset();

export interface SessionClient {
  id: string;
  name: string;
  slug: string;
  clientCode: string;
  currency?: string;
}

const TOKEN_KEY = "falah_os_token";
const CLIENT_KEY = "falah_os_client";

function storage() {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function getToken() {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

export function getClient(): SessionClient | null {
  const raw = storage()?.getItem(CLIENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionClient;
  } catch {
    return null;
  }
}

export function saveSession(token: string, client: SessionClient) {
  storage()?.setItem(TOKEN_KEY, token);
  storage()?.setItem(CLIENT_KEY, JSON.stringify(client));
}

export function updateClient(patch: Partial<SessionClient>) {
  const current = getClient();
  if (current) storage()?.setItem(CLIENT_KEY, JSON.stringify({ ...current, ...patch }));
  window.dispatchEvent(new Event("falah:client"));
}

export function clearSession() {
  storage()?.removeItem(TOKEN_KEY);
  storage()?.removeItem(CLIENT_KEY);
}

export function signOut() {
  clearSession();
  window.location.assign("/");
}

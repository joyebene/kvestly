export interface ApiError { code: string; message: string; fields?: Record<string, string> }
export async function postJson<T = Record<string, unknown>>(url: string, body?: unknown): Promise<{ ok: true; data: T } | { ok: false; error: ApiError }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}), credentials: "same-origin" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: j.error ?? { code: "error", message: "Something went wrong. Please try again." } };
    return { ok: true, data: j as T };
  } catch {
    return { ok: false, error: { code: "network", message: "Network error. Check your connection and try again." } };
  }
}

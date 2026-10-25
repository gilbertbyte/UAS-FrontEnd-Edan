/** fetch JSON helper untuk komponen client. Melempar Error dengan pesan dari server. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, headers, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...headers } : headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "same-origin",
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* body kosong */
  }
  if (!res.ok) {
    const message = (data as { error?: string } | null)?.error || "Terjadi kesalahan. Coba lagi.";
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function uploadImage(url: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append("image", file);
  const data = await api<{ url: string }>(url, { method: "POST", body: fd });
  return data.url;
}

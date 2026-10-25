import { getDb } from "./db";
import { fail } from "./http";
import { getSession } from "./session";

export type TokoUser = { id: number; role: string; status: string; store_id: number | null };

/** Pakai: const g = await requireAdmin(); if (g instanceof Response) return g; */
export async function requireAdmin() {
  const s = await getSession();
  if (!s?.adminId) return fail("Not authenticated", 401);
  return s;
}

export async function requireUser() {
  const s = await getSession();
  if (!s?.userId) return fail("Kamu harus login dulu.", 401);
  return s as typeof s & { userId: number };
}

export async function requireToko(): Promise<TokoUser | Response> {
  const s = await getSession();
  if (!s?.userId) return fail("Kamu harus login dulu.", 401);
  const user = getDb()
    .prepare("SELECT id, role, status, store_id FROM users WHERE id = ?")
    .get(s.userId) as TokoUser | undefined;
  if (!user || user.role !== "toko") return fail("Akses khusus akun toko.", 403);
  if (user.status !== "approved") return fail("Akun toko kamu belum disetujui admin.", 403);
  return user;
}

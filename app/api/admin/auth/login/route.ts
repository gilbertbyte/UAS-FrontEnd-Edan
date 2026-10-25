import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { fail, json, readJson, str } from "@/lib/http";
import { clientIp, hit, reset } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  const key = `admin-login:${clientIp(req)}`;
  if (hit(key, 10, 15 * 60 * 1000).limited) return fail("Terlalu banyak percobaan login. Coba lagi nanti.", 429);

  const b = await readJson(req);
  const username = str(b.username).trim();
  const password = str(b.password);
  if (!username || !password) return fail("Username dan password wajib diisi.");

  const user = getDb().prepare("SELECT * FROM admin_users WHERE username = ?").get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return fail("Username atau password salah.", 401);

  reset(key); // login sukses tidak dihitung sebagai percobaan gagal
  await createSession({ adminId: user.id, username: user.username });
  return json({ ok: true, redirect: "/admin" });
}

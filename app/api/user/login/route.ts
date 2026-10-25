import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { fail, json, readJson, str } from "@/lib/http";
import { clientIp, hit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";

type UserRow = { id: number; nama: string; email: string; password_hash: string; role: string; status: string };

export async function POST(req: Request) {
  if (hit(`user-auth:${clientIp(req)}`, 20, 15 * 60 * 1000).limited) return fail("Terlalu banyak percobaan. Coba lagi nanti.", 429);

  const b = await readJson(req);
  const email = str(b.email).trim().toLowerCase();
  const password = str(b.password);
  if (!email || !password) return fail("Email dan password wajib diisi.");

  const user = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return fail("Email atau password salah.", 401);

  if (user.role === "toko" && user.status !== "approved") {
    return fail(
      user.status === "pending" ? "Akun toko kamu masih menunggu persetujuan admin." : "Pendaftaran toko kamu ditolak admin.",
      403
    );
  }

  await createSession({ userId: user.id, userNama: user.nama });
  return json({ ok: true, nama: user.nama, email: user.email, role: user.role });
}

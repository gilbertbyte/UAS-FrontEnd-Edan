import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { fail, json, readJson, str } from "@/lib/http";
import { clientIp, hit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { isValidEmail } from "@/lib/validate";


export async function POST(req: Request) {
  if (hit(`user-auth:${clientIp(req)}`, 20, 15 * 60 * 1000).limited) return fail("Terlalu banyak percobaan. Coba lagi nanti.", 429);

  const b = await readJson(req);
  const nama = str(b.nama).trim();
  const email = str(b.email).trim().toLowerCase();
  const password = str(b.password);

  if (!nama || !email || !password) return fail("Nama, email, dan password wajib diisi.");
  if (!isValidEmail(email)) return fail("Format email tidak valid.");
  if (password.length < 8) return fail("Password minimal 8 karakter.");

  const db = getDb();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) return fail("Email sudah terdaftar.", 409);

  const hash = await bcrypt.hash(password, 12);
  const r = db.prepare("INSERT INTO users (nama, email, password_hash) VALUES (?, ?, ?)").run(nama, email, hash);

  await createSession({ userId: Number(r.lastInsertRowid), userNama: nama });
  return json({ ok: true, nama, email }, 201);
}

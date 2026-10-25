import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { fail, json, readJson, str } from "@/lib/http";
import { clientIp, hit } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validate";

export async function POST(req: Request) {
  if (hit(`user-auth:${clientIp(req)}`, 20, 15 * 60 * 1000).limited) return fail("Terlalu banyak percobaan. Coba lagi nanti.", 429);

  const b = await readJson(req);
  const nama = str(b.nama).trim();
  const email = str(b.email).trim().toLowerCase();
  const password = str(b.password);
  const namaToko = str(b.nama_toko).trim();
  const alamat = str(b.alamat).trim();

  if (!nama || !email || !password || !namaToko) return fail("Nama, email, password, dan nama toko wajib diisi.");
  if (!isValidEmail(email)) return fail("Format email tidak valid.");
  if (password.length < 8) return fail("Password minimal 8 karakter.");

  const db = getDb();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) return fail("Email sudah terdaftar.", 409);

  const hash = await bcrypt.hash(password, 12);
  // Toko baru berstatus "pending": belum tampil ke publik sampai admin approve.
  db.transaction(() => {
    const store = db
      .prepare("INSERT INTO stores (nama, alamat, approval_status, sort_order) VALUES (?, ?, 'pending', 0)")
      .run(namaToko, alamat);
    db.prepare(
      "INSERT INTO users (nama, email, password_hash, role, status, store_id) VALUES (?, ?, ?, 'toko', 'pending', ?)"
    ).run(nama, email, hash, store.lastInsertRowid);
  })();

  return json({ ok: true, message: "Pendaftaran toko berhasil dikirim. Akunmu akan aktif setelah disetujui admin." }, 201);
}

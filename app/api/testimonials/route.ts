import { getDb } from "@/lib/db";
import { fail, json, readJson, str } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) return fail("Kamu harus login dulu untuk menulis ulasan.", 401);

  const body = await readJson(req);
  const ulasan = str(body.ulasan).trim();
  if (!ulasan) return fail("Ulasan tidak boleh kosong.");

  const targetType = body.target_type;
  if (targetType !== "store" && targetType !== "menu") return fail("Pilih dulu toko atau menu yang mau kamu ulas.");

  const targetId = Number(body.target_id);
  if (!Number.isInteger(targetId)) return fail("Toko/menu yang dipilih tidak valid.");

  const db = getDb();
  const target = (
    targetType === "store"
      ? db.prepare("SELECT id, nama FROM stores WHERE id = ?").get(targetId)
      : db.prepare("SELECT id, nama FROM menu_items WHERE id = ?").get(targetId)
  ) as { id: number; nama: string } | undefined;
  if (!target) return fail("Toko/menu yang dipilih tidak ditemukan.");

  const s = Number(body.stars);
  const stars = Number.isInteger(s) && s >= 1 && s <= 5 ? s : 5;

  db.prepare(
    `INSERT INTO testimonials (nama, ulasan, waktu, stars, approved, sort_order, target_type, target_id, target_nama)
     VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?)`
  ).run(session.userNama || "Pengguna", ulasan, "Baru saja", stars, targetType, target.id, target.nama);

  return json({ ok: true, message: "Terima kasih! Ulasan kamu akan tampil setelah disetujui admin." }, 201);
}

import { getDb } from "@/lib/db";
import { fail, json, readJson } from "@/lib/http";
import { requireToko } from "@/lib/guards";
import { cleanMenuBody, imagesToColumn, MAX_MENU_IMAGES, readMenuImages } from "@/lib/menu-body";

export async function GET() {
  const g = await requireToko();
  if (g instanceof Response) return g;
  return json(getDb().prepare("SELECT * FROM menu_items WHERE store_id = ? ORDER BY sort_order ASC, id ASC").all(g.store_id));
}

export async function POST(req: Request) {
  const g = await requireToko();
  if (g instanceof Response) return g;
  const b = await readJson(req);
  const m = cleanMenuBody(b);
  if (!m.nama) return fail("Nama menu wajib diisi.");
  if (m.nama.length > 100) return fail("Nama menu maksimal 100 karakter.");
  const images = readMenuImages(b);
  if (images === null) return fail(`Gambar tidak valid (maksimal ${MAX_MENU_IMAGES} gambar).`);

  const db = getDb();
  const info = db
    .prepare("INSERT INTO menu_items (nama, deskripsi, harga, image_url, store_id, sort_order) VALUES (?, ?, ?, ?, ?, 0)")
    .run(m.nama, m.deskripsi || "", m.harga || "", imagesToColumn(images || []), g.store_id);
  return json({ ok: true, menu: db.prepare("SELECT * FROM menu_items WHERE id = ?").get(info.lastInsertRowid) }, 201);
}

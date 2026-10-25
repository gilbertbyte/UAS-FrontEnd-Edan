import { getDb } from "@/lib/db";
import { fail, json, readJson } from "@/lib/http";
import { requireToko } from "@/lib/guards";
import { cleanMenuBody, imagesToColumn, MAX_MENU_IMAGES, readMenuImages } from "@/lib/menu-body";

type Row = { id: number; nama: string; deskripsi: string | null; harga: string | null; image_url: string | null };
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireToko();
  if (g instanceof Response) return g;
  const db = getDb();
  const row = db.prepare("SELECT * FROM menu_items WHERE id = ? AND store_id = ?").get(Number((await params).id), g.store_id) as Row | undefined;
  if (!row) return fail("Menu tidak ditemukan.", 404);

  const b = await readJson(req);
  const m = cleanMenuBody(b);
  const nama = m.nama !== undefined ? m.nama : row.nama;
  if (!nama) return fail("Nama menu wajib diisi.");
  if (nama.length > 100) return fail("Nama menu maksimal 100 karakter.");
  const images = readMenuImages(b);
  if (images === null) return fail(`Gambar tidak valid (maksimal ${MAX_MENU_IMAGES} gambar).`);

  db.prepare("UPDATE menu_items SET nama = ?, deskripsi = ?, harga = ?, image_url = ? WHERE id = ?").run(
    nama,
    m.deskripsi !== undefined ? m.deskripsi : row.deskripsi,
    m.harga !== undefined ? m.harga : row.harga,
    images !== undefined ? imagesToColumn(images) : row.image_url,
    row.id
  );
  return json({ ok: true, menu: db.prepare("SELECT * FROM menu_items WHERE id = ?").get(row.id) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireToko();
  if (g instanceof Response) return g;
  const db = getDb();
  const row = db.prepare("SELECT id FROM menu_items WHERE id = ? AND store_id = ?").get(Number((await params).id), g.store_id) as { id: number } | undefined;
  if (!row) return fail("Menu tidak ditemukan.", 404);
  db.transaction(() => {
    db.prepare("DELETE FROM testimonials WHERE target_type = 'menu' AND target_id = ?").run(row.id);
    db.prepare("DELETE FROM wishlist_items WHERE item_type = 'menu' AND item_id = ?").run(row.id);
    db.prepare("DELETE FROM menu_items WHERE id = ?").run(row.id);
  })();
  return json({ ok: true });
}

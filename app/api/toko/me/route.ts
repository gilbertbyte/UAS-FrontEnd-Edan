import { getDb } from "@/lib/db";
import { fail, json, readJson, str } from "@/lib/http";
import { requireToko } from "@/lib/guards";

type StoreRow = { id: number; alamat: string | null; jam_buka: string | null; jam_tutup: string | null; image_url: string | null };

export async function GET() {
  const g = await requireToko();
  if (g instanceof Response) return g;
  return json({ store: getDb().prepare("SELECT * FROM stores WHERE id = ?").get(g.store_id) });
}

export async function PUT(req: Request) {
  const g = await requireToko();
  if (g instanceof Response) return g;
  const db = getDb();
  const store = db.prepare("SELECT * FROM stores WHERE id = ?").get(g.store_id) as StoreRow | undefined;
  if (!store) return fail("Toko tidak ditemukan.", 404);

  const b = await readJson(req);
  const nama = str(b.nama).trim();
  if (!nama) return fail("Nama toko wajib diisi.");

  let image = store.image_url;
  if (Array.isArray(b.images)) {
    image = JSON.stringify(b.images.filter((u) => typeof u === "string" && u.startsWith("/uploads/")));
  }

  db.prepare("UPDATE stores SET nama = ?, alamat = ?, jam_buka = ?, jam_tutup = ?, image_url = ? WHERE id = ?").run(
    nama,
    b.alamat !== undefined ? str(b.alamat).trim() : store.alamat,
    b.jam_buka !== undefined ? str(b.jam_buka) : store.jam_buka,
    b.jam_tutup !== undefined ? str(b.jam_tutup) : store.jam_tutup,
    image,
    store.id
  );
  return json({ ok: true, store: db.prepare("SELECT * FROM stores WHERE id = ?").get(store.id) });
}

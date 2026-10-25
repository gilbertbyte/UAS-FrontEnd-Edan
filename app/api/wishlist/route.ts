import { getDb } from "@/lib/db";
import { fail, json, readJson } from "@/lib/http";
import { requireUser } from "@/lib/guards";

export async function GET() {
  const g = await requireUser();
  if (g instanceof Response) return g;
  const db = getDb();
  const rows = db.prepare("SELECT item_type, item_id FROM wishlist_items WHERE user_id = ?").all(g.userId) as {
    item_type: string;
    item_id: number;
  }[];
  const menuIds = rows.filter((r) => r.item_type === "menu").map((r) => r.item_id);
  const storeIds = rows.filter((r) => r.item_type === "store").map((r) => r.item_id);
  const marks = (ids: number[]) => ids.map(() => "?").join(",");

  const menu = menuIds.length
    ? db
        .prepare(
          `SELECT menu_items.*, stores.nama AS store_nama FROM menu_items
           LEFT JOIN stores ON stores.id = menu_items.store_id WHERE menu_items.id IN (${marks(menuIds)})`
        )
        .all(...menuIds)
    : [];
  const stores = storeIds.length
    ? db.prepare(`SELECT * FROM stores WHERE id IN (${marks(storeIds)})`).all(...storeIds)
    : [];
  return json({ menu, stores });
}

export async function POST(req: Request) {
  const g = await requireUser();
  if (g instanceof Response) return g;
  const b = await readJson(req);
  const type = b.item_type;
  const id = Number(b.item_id);
  if ((type !== "menu" && type !== "store") || !id) return fail("item_type dan item_id wajib diisi.");

  // INSERT OR IGNORE: kalau sudah ada di wishlist, tidak error
  getDb()
    .prepare("INSERT OR IGNORE INTO wishlist_items (user_id, item_type, item_id) VALUES (?, ?, ?)")
    .run(g.userId, type, id);
  return json({ ok: true }, 201);
}

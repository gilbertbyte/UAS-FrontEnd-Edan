import { getDb } from "@/lib/db";
import { json } from "@/lib/http";
import { requireToko } from "@/lib/guards";

// Read-only. Approve/edit/hapus ulasan tetap hanya lewat admin.
export async function GET() {
  const g = await requireToko();
  if (g instanceof Response) return g;
  const db = getDb();
  const menuIds = (db.prepare("SELECT id FROM menu_items WHERE store_id = ?").all(g.store_id) as { id: number }[]).map((r) => r.id);
  const rows = db
    .prepare(
      `SELECT * FROM testimonials
       WHERE (target_type = 'store' AND target_id = ?)
          OR (target_type = 'menu' AND target_id IN (${menuIds.length ? menuIds.map(() => "?").join(",") : "NULL"}))
       ORDER BY id DESC`
    )
    .all(g.store_id, ...menuIds);
  return json(rows);
}

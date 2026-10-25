import { getDb } from "@/lib/db";
import { json } from "@/lib/http";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  return json(
    getDb()
      .prepare(
        `SELECT users.id AS user_id, users.nama, users.email, users.created_at,
                stores.id AS store_id, stores.nama AS store_nama, stores.alamat AS store_alamat
         FROM users JOIN stores ON stores.id = users.store_id
         WHERE users.role = 'toko' AND users.status = 'pending'
         ORDER BY users.created_at ASC`
      )
      .all()
  );
}

import { getDb } from "@/lib/db";
import { fail, json } from "@/lib/http";
import { requireAdmin } from "@/lib/guards";

export async function POST(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'toko'").get(Number((await params).userId)) as
    | { id: number; store_id: number | null }
    | undefined;
  if (!user) return fail("Pendaftaran toko tidak ditemukan.", 404);

  db.transaction(() => {
    db.prepare("UPDATE users SET status = 'approved' WHERE id = ?").run(user.id);
    if (user.store_id) db.prepare("UPDATE stores SET approval_status = 'approved' WHERE id = ?").run(user.store_id);
  })();
  return json({ ok: true });
}

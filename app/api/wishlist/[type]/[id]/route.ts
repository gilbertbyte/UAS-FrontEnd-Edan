import { getDb } from "@/lib/db";
import { json } from "@/lib/http";
import { requireUser } from "@/lib/guards";

export async function DELETE(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const g = await requireUser();
  if (g instanceof Response) return g;
  const { type, id } = await params;
  getDb()
    .prepare("DELETE FROM wishlist_items WHERE user_id = ? AND item_type = ? AND item_id = ?")
    .run(g.userId, type, Number(id));
  return json({ ok: true });
}

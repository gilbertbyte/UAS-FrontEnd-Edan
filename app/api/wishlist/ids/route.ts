import { getDb } from "@/lib/db";
import { json } from "@/lib/http";
import { requireUser } from "@/lib/guards";

export async function GET() {
  const g = await requireUser();
  if (g instanceof Response) return g;
  return json(getDb().prepare("SELECT item_type, item_id FROM wishlist_items WHERE user_id = ?").all(g.userId));
}

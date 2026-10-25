import { getDb } from "@/lib/db";
import { json } from "@/lib/http";
import { requireAdmin } from "@/lib/guards";

export async function GET() {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const out: Record<string, unknown> = {};
  (getDb().prepare("SELECT key, data FROM content_blocks").all() as { key: string; data: string }[]).forEach((r) => {
    out[r.key] = JSON.parse(r.data);
  });
  return json(out);
}

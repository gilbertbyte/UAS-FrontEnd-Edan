import { getDb } from "@/lib/db";
import { RESOURCES } from "@/lib/admin-resources";
import { fail, json, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/guards";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const { resource, id } = await params;
  const r = RESOURCES[resource];
  if (!r) return fail("Not found.", 404);

  const db = getDb();
  const existing = db.prepare(`SELECT * FROM ${r.table} WHERE id = ?`).get(Number(id)) as Record<string, unknown> | undefined;
  if (!existing) return fail("Not found.", 404);

  const body = await readJson(req);
  const values: Record<string, unknown> = { id: Number(id) };
  for (const f of r.fields) {
    let v = body[f.name] !== undefined ? body[f.name] : existing[f.name];
    if (f.nullable && v === "") v = null;
    if (Array.isArray(v)) v = JSON.stringify(v);
    values[f.name] = v;
  }
  db.prepare(`UPDATE ${r.table} SET ${r.fields.map((f) => `${f.name} = @${f.name}`).join(", ")} WHERE id = @id`).run(values);
  return json(db.prepare(`SELECT * FROM ${r.table} WHERE id = ?`).get(Number(id)));
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const { resource, id } = await params;
  const r = RESOURCES[resource];
  if (!r) return fail("Not found.", 404);

  const db = getDb();
  if (!db.prepare(`SELECT id FROM ${r.table} WHERE id = ?`).get(Number(id))) return fail("Not found.", 404);
  try {
    db.transaction(() => {
      r.beforeDelete?.(Number(id));
      db.prepare(`DELETE FROM ${r.table} WHERE id = ?`).run(Number(id));
    })();
    return json({ ok: true });
  } catch (err) {
    console.error(`Gagal menghapus dari ${r.table} (id=${id}):`, err);
    return fail("Gagal menghapus: " + (err as Error).message, 500);
  }
}

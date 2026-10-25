import { getDb } from "@/lib/db";
import { RESOURCES } from "@/lib/admin-resources";
import { fail, json, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/guards";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const r = RESOURCES[(await params).resource];
  if (!r) return fail("Not found.", 404);
  return json(getDb().prepare(`SELECT * FROM ${r.table} ORDER BY sort_order ASC, id ASC`).all());
}

export async function POST(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const r = RESOURCES[(await params).resource];
  if (!r) return fail("Not found.", 404);

  const body = await readJson(req);
  const required = body[r.required];
  if (!required || !String(required).trim()) return fail(`${r.required} is required.`);

  const values: Record<string, unknown> = {};
  for (const f of r.fields) {
    let v = body[f.name] !== undefined ? body[f.name] : f.default;
    if (f.nullable && v === "") v = null;
    if (Array.isArray(v)) v = JSON.stringify(v);
    values[f.name] = v;
  }
  const cols = r.fields.map((f) => f.name);
  const db = getDb();
  const res = db
    .prepare(`INSERT INTO ${r.table} (${cols.join(", ")}) VALUES (${cols.map((c) => `@${c}`).join(", ")})`)
    .run(values);
  return json(db.prepare(`SELECT * FROM ${r.table} WHERE id = ?`).get(res.lastInsertRowid), 201);
}

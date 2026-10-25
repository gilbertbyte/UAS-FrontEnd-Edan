import { getDb } from "@/lib/db";
import { CONTENT_KEYS } from "@/lib/admin-resources";
import { fail, json, readJson } from "@/lib/http";
import { requireAdmin } from "@/lib/guards";
import { imageList } from "@/lib/images";

type Ctx = { params: Promise<{ key: string }> };

function load(key: string) {
  const row = getDb().prepare("SELECT data FROM content_blocks WHERE key = ?").get(key) as { data: string } | undefined;
  return row ? (JSON.parse(row.data) as Record<string, unknown>) : null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const { key } = await params;
  if (!CONTENT_KEYS.includes(key)) return fail("Unknown content section.", 404);
  const data = load(key);
  if (!data) return fail("Content section not found.", 404);
  if (key === "about" && data.images === undefined) data.images = data.image_url ? [data.image_url] : [];
  return json(data);
}

export async function PUT(req: Request, { params }: Ctx) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  const { key } = await params;
  if (!CONTENT_KEYS.includes(key)) return fail("Unknown content section.", 404);
  const current = load(key);
  if (!current) return fail("Content section not found.", 404);

  const incoming = await readJson(req);
  const merged = { ...current };
  const fields = Object.keys(current);
  if (key === "about" && !fields.includes("images")) fields.push("images");

  // Hanya field yang sudah ada di blok yang boleh diubah
  for (const field of fields) {
    if (!(field in incoming)) continue;
    merged[field] = field === "images" ? imageList(incoming[field]) : String(incoming[field] ?? "");
  }

  getDb().prepare("UPDATE content_blocks SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?").run(JSON.stringify(merged), key);
  return json(merged);
}

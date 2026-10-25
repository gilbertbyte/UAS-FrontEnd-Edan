import fs from "fs";
import path from "path";
import { UPLOADS_DIR } from "@/lib/config";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Menyajikan gambar upload dari DATA_DIR/uploads (file baru langsung bisa diakses tanpa rebuild).
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const name = path.basename(parts.join("/")); // basename mencegah path traversal (../)
  const type = TYPES[path.extname(name).toLowerCase()];
  const file = path.join(UPLOADS_DIR, name);
  if (!type || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(fs.readFileSync(file)), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

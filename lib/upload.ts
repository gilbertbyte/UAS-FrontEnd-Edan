import crypto from "crypto";
import fs from "fs";
import path from "path";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOADS_DIR } from "./config";
import { fail, json } from "./http";

/** Simpan 1 gambar dari form-data field "image". Mengembalikan Response JSON {url}. */
export async function handleImageUpload(req: Request, prefix: string) {
  let file: FormDataEntryValue | null = null;
  try {
    file = (await req.formData()).get("image");
  } catch {
    return fail("Tidak ada file yang diupload.");
  }
  if (!(file instanceof File) || file.size === 0) return fail("Tidak ada file yang diupload.");

  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) return fail("Hanya file JPG, PNG, atau WEBP yang diizinkan.");
  if (file.size > MAX_UPLOAD_BYTES) return fail("Ukuran file maksimal 3MB.");

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const name = `${prefix}-${Date.now()}-${crypto.randomInt(1e9)}${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()));
  return json({ url: `/uploads/${name}` });
}

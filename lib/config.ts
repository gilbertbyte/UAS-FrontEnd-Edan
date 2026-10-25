import path from "path";

// Semua data (database + gambar upload) disimpan di DATA_DIR.
// Di Railway: pasang Volume ke /app/data (atau set DATA_DIR) supaya data tidak hilang saat deploy.
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
export const DB_PATH = path.join(DATA_DIR, "app.db");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

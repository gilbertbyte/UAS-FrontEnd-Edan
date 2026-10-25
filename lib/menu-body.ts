import { str } from "./http";

export const MAX_MENU_IMAGES = 10;

export function cleanMenuBody(b: Record<string, unknown>) {
  const f = (v: unknown) => (v === undefined ? undefined : str(v).trim());
  return { nama: f(b.nama), harga: f(b.harga), deskripsi: f(b.deskripsi) };
}

/** undefined = tidak diubah, null = tidak valid, array = daftar URL gambar yang sah */
export function readMenuImages(b: Record<string, unknown>): string[] | null | undefined {
  const raw = Array.isArray(b.images) ? b.images : Array.isArray(b.image_url) ? b.image_url : undefined;
  if (!raw) return undefined;
  const list = raw.filter((u): u is string => typeof u === "string" && !!u.trim()).map((u) => u.trim());
  if (list.length > MAX_MENU_IMAGES || !list.every((u) => u.startsWith("/uploads/"))) return null;
  return list;
}

export const imagesToColumn = (list: string[]) => (list.length ? JSON.stringify(list) : "");

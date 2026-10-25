/** Kolom image_url bisa berisi string URL, JSON array, atau array. Selalu jadikan array. */
export function imageList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter(Boolean) as string[];
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    /* bukan JSON -> anggap satu URL */
  }
  return [value];
}

import { getDb } from "./db";

type Field = { name: string; default: unknown; nullable?: boolean };
export type Resource = {
  table: string;
  required: string;
  fields: Field[];
  beforeDelete?: (id: number) => void;
};

// Konfigurasi CRUD admin: satu handler generik melayani stores, menu, testimonials, dan faqs.
export const RESOURCES: Record<string, Resource> = {
  stores: {
    table: "stores",
    required: "nama",
    fields: [
      { name: "nama", default: "" },
      { name: "alamat", default: "" },
      { name: "jam_buka", default: "" },
      { name: "jam_tutup", default: "" },
      { name: "rating", default: 0 },
      { name: "ulasan_count", default: 0 },
      { name: "sort_order", default: 0 },
      { name: "image_url", default: "" },
      { name: "approval_status", default: "approved" },
    ],
    beforeDelete: (storeId) => {
      const db = getDb();
      const menuIds = (db.prepare("SELECT id FROM menu_items WHERE store_id = ?").all(storeId) as { id: number }[]).map((m) => m.id);
      if (menuIds.length) {
        db.prepare(
          `DELETE FROM testimonials WHERE target_type = 'menu' AND target_id IN (${menuIds.map(() => "?").join(",")})`
        ).run(...menuIds);
      }
      db.prepare("DELETE FROM testimonials WHERE target_type = 'store' AND target_id = ?").run(storeId);
      db.prepare("DELETE FROM menu_items WHERE store_id = ?").run(storeId);
      db.prepare("UPDATE users SET store_id = NULL WHERE store_id = ?").run(storeId);
    },
  },
  menu: {
    table: "menu_items",
    required: "nama",
    fields: [
      { name: "nama", default: "" },
      { name: "deskripsi", default: "" },
      { name: "harga", default: "" },
      { name: "sort_order", default: 0 },
      { name: "store_id", default: null, nullable: true },
      { name: "image_url", default: "" },
    ],
    beforeDelete: (id) => {
      getDb().prepare("DELETE FROM testimonials WHERE target_type = 'menu' AND target_id = ?").run(id);
    },
  },
  testimonials: {
    table: "testimonials",
    required: "nama",
    fields: [
      { name: "nama", default: "" },
      { name: "ulasan", default: "" },
      { name: "waktu", default: "" },
      { name: "stars", default: 5 },
      { name: "sort_order", default: 0 },
      { name: "approved", default: 0 },
    ],
  },
  faqs: {
    table: "faqs",
    required: "question",
    fields: [
      { name: "question", default: "" },
      { name: "answer", default: "" },
      { name: "sort_order", default: 0 },
    ],
  },
};

export const CONTENT_KEYS = [
  "site", "hero", "toko_populer", "menu_section", "about", "history",
  "testimonial_section", "cari_toko", "faq_section", "contact", "footer",
];

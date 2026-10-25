import fs from "fs";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { DATA_DIR, DB_PATH, UPLOADS_DIR } from "./config";

type DB = Database.Database;

const globalForDb = globalThis as unknown as { __pisangijoDb?: DB };

function ensureColumn(db: DB, table: string, column: string, definition: string) {
  const cols = (db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function seedContentBlock(db: DB, key: string, data: unknown) {
  const existing = db.prepare("SELECT key FROM content_blocks WHERE key = ?").get(key);
  if (!existing) db.prepare("INSERT INTO content_blocks (key, data) VALUES (?, ?)").run(key, JSON.stringify(data));
}

function init(): DB {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      alamat TEXT,
      jam_buka TEXT,
      jam_tutup TEXT,
      rating REAL DEFAULT 0,
      ulasan_count INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      deskripsi TEXT,
      harga TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      ulasan TEXT,
      waktu TEXT,
      stars INTEGER DEFAULT 5,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_type, item_id)
    );
    CREATE TABLE IF NOT EXISTS content_blocks (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);

  // Migrasi kolom (kompatibel dengan app.db dari versi Express)
  ensureColumn(db, "stores", "jam_tutup", "TEXT");
  ensureColumn(db, "stores", "image_url", "TEXT");
  ensureColumn(db, "stores", "ulasan_count", "INTEGER DEFAULT 0");
  ensureColumn(db, "stores", "sort_order", "INTEGER DEFAULT 0");
  ensureColumn(db, "stores", "approval_status", "TEXT DEFAULT 'approved'");
  ensureColumn(db, "menu_items", "sort_order", "INTEGER DEFAULT 0");
  ensureColumn(db, "menu_items", "store_id", "INTEGER REFERENCES stores(id)");
  ensureColumn(db, "menu_items", "image_url", "TEXT");
  ensureColumn(db, "testimonials", "stars", "INTEGER DEFAULT 5");
  ensureColumn(db, "testimonials", "sort_order", "INTEGER DEFAULT 0");
  ensureColumn(db, "testimonials", "target_type", "TEXT");
  ensureColumn(db, "testimonials", "target_id", "INTEGER");
  ensureColumn(db, "testimonials", "target_nama", "TEXT");
  const hadApproved = (db.prepare("PRAGMA table_info(testimonials)").all() as { name: string }[]).some(
    (c) => c.name === "approved"
  );
  ensureColumn(db, "testimonials", "approved", "INTEGER DEFAULT 0");
  if (!hadApproved) db.prepare("UPDATE testimonials SET approved = 1").run();
  ensureColumn(db, "faqs", "sort_order", "INTEGER DEFAULT 0");
  ensureColumn(db, "users", "role", "TEXT DEFAULT 'user'");
  ensureColumn(db, "users", "status", "TEXT DEFAULT 'approved'");
  ensureColumn(db, "users", "store_id", "INTEGER REFERENCES stores(id)");

  seedContentBlock(db, "site", { site_title: "Pisang Ijo", logo_text: "Pisang Ijo" });
  seedContentBlock(db, "hero", {
    badge: "Platform Kuliner Makassar",
    heading: "Temukan Es Pisang Ijo Favorit Kamu",
    subheading: "Jelajahi pilihan es pisang ijo dan temukan menu kesukaanmu",
    search_placeholder: "Cari toko atau menu es pisang ijo",
    cta_primary: "Cari Toko",
    cta_secondary: "Lihat Menu",
  });
  seedContentBlock(db, "toko_populer", {
    heading: "Toko Populer & Rating",
    subheading: "Temukan toko yang sesuai dengan citarasa kesukaanmu",
    link_text: "Lihat semua toko",
  });
  seedContentBlock(db, "menu_section", {
    heading: "Menu Unggulan",
    subheading: "Pilih paduan rasa favorit untuk anda coba nanti",
  });
  seedContentBlock(db, "about", {
    eyebrow: "Tentang Platform",
    heading: "Merayakan segarnya rasa yang akrab",
    description:
      "Satu mangkuk es pisang ijo yang enak selalu dimulai dari bahan yang tepat — pisang yang segar, santan yang lembut, dan saus atau sirup dengan rasa yang pas, tidak terlalu manis. Di Pisang Ijo, kami mengumpulkan toko-toko pilihan yang menjaga standar itu, sekaligus menghadirkan layanan yang terasa hangat di setiap pesanan.",
    media_text: "Ceritanya Gambar Bahan Bahan Pisang Ijo",
    images: [],
    image_url: "",
    pill_1: "Pisang Segar Pilihan",
    pill_2: "Santan Lembut",
    pill_3: "Layanan Penuh Perhatian",
  });
  seedContentBlock(db, "history", {
    heading: "Sejarah Pisang Ijo",
    text: "Es pisang ijo dikenal sebagai hidangan khas Makassar, Sulawesi Selatan. Pisang dibalut adonan berwarna hijau yang umumnya memakai pandan atau daun suji untuk aroma dan warna, lalu disajikan dengan bubur sumsum atau saus santan, sirup, dan es.",
  });
  seedContentBlock(db, "testimonial_section", {
    eyebrow: "Kota Mereka #MerekaBicara",
    heading: "Testimoni Pelanggan",
    cta: "Tulis Ulasan",
  });
  seedContentBlock(db, "cari_toko", {
    eyebrow: "Pencarian Lokasi",
    heading: "Cari Toko Es Pisang Ijo",
    subheading: "Masukkan nama toko atau menu dan area/kota secara manual",
  });
  seedContentBlock(db, "faq_section", { eyebrow: "Butuh Bantuan?", heading: "Pertanyaan Yang Sering Ditanyakan" });
  seedContentBlock(db, "contact", {
    eyebrow: "Kontak",
    heading: "Mari ngobrol tentang rasa favoritmu",
    email: "halo@pisangijokita.com",
    whatsapp: "+62 700 0000 0000",
    note: "Butuh bantuan menggunakan halaman demo ini? Hubungi kanal contoh berikut pada jam layanan umum.",
    hours: "Senin - Sabtu, 09.00 - 18.00",
  });
  seedContentBlock(db, "footer", {
    tagline: "Platform demo untuk menjelajahi menu dan toko es pisang ijo",
    social_text: "Sosial demo : Instagram - TikTok - Facebook",
    help_email: "halo@pisangijokita.com",
    help_whatsapp: "+62 800 0000 0000",
    legal_terms_label: "Syarat & Ketentuan",
    legal_privacy_label: "Kebijakan Privasi",
    copyright: "2026 Pisang Ijo",
  });

  // Data contoh hanya diisi jika tabel masih kosong (database baru)
  if ((db.prepare("SELECT COUNT(*) AS c FROM stores").get() as { c: number }).c === 0) {
    const ins = db.prepare(
      "INSERT INTO stores (nama, alamat, jam_buka, jam_tutup, sort_order) VALUES (@nama, @alamat, @jam_buka, @jam_tutup, @sort_order)"
    );
    [
      { nama: "Es Pisang Ijo Bu Ida", alamat: "Jl. Pengayoman, Makassar", jam_buka: "08:00", jam_tutup: "21:00", sort_order: 1 },
      { nama: "Pisang Ijo Daeng Sija", alamat: "Jl. Boulevard, Makassar", jam_buka: "09:00", jam_tutup: "20:00", sort_order: 2 },
      { nama: "Pisang Ijo Ratu Rasa", alamat: "Jl. Sultan Alauddin, Makassar", jam_buka: "10:00", jam_tutup: "18:00", sort_order: 3 },
    ].forEach((s) => ins.run(s));
  }
  if ((db.prepare("SELECT COUNT(*) AS c FROM menu_items").get() as { c: number }).c === 0) {
    const ins = db.prepare(
      "INSERT INTO menu_items (nama, deskripsi, harga, sort_order, store_id) VALUES (@nama, @deskripsi, @harga, @sort_order, @store_id)"
    );
    [
      { nama: "Pisang Ijo Original", deskripsi: "Saus santan, bubur sumsum", harga: "Rp 15.000", sort_order: 1, store_id: 1 },
      { nama: "Pisang Ijo Cokelat", deskripsi: "Topping cokelat leleh", harga: "Rp 17.000", sort_order: 2, store_id: 1 },
      { nama: "Pisang Ijo Durian", deskripsi: "Dengan durian asli", harga: "Rp 20.000", sort_order: 3, store_id: 2 },
      { nama: "Pisang Ijo Keju", deskripsi: "Taburan keju parut", harga: "Rp 18.000", sort_order: 4, store_id: 3 },
    ].forEach((m) => ins.run(m));
  }
  if ((db.prepare("SELECT COUNT(*) AS c FROM faqs").get() as { c: number }).c === 0) {
    const ins = db.prepare("INSERT INTO faqs (question, answer, sort_order) VALUES (@question, @answer, @sort_order)");
    [
      { question: "Bagaimana Cara Pesan?", answer: "Pilih toko atau menu favoritmu, lalu hubungi toko langsung melalui kontak yang tersedia di halaman detail toko.", sort_order: 1 },
      { question: "Apakah tersedia pilihan varian?", answer: "Ya, sebagian besar toko menyediakan beberapa varian topping dan tingkat kemanisan.", sort_order: 2 },
      { question: "Berapa estimasi proses pesanan?", answer: "Estimasi waktu bervariasi tergantung toko, umumnya 15-30 menit setelah pesanan dikonfirmasi.", sort_order: 3 },
      { question: "Bagaimana cara daftar akun?", answer: "Klik tombol Login / Sign In di bagian atas halaman, lalu ikuti langkah pendaftaran akun baru.", sort_order: 4 },
      { question: "Bagaimana cara memberi ulasan?", answer: "Setelah login, kamu dapat menekan tombol Tulis Ulasan pada bagian testimoni pelanggan.", sort_order: 5 },
      { question: "Apakah semua toko menerima pesanan online?", answer: "Tidak semua, status penerimaan pesanan online ditampilkan pada masing-masing halaman toko.", sort_order: 6 },
    ].forEach((f) => ins.run(f));
  }

  // Sinkronkan akun admin dari environment (sama seperti versi Express)
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (ADMIN_USERNAME && ADMIN_PASSWORD) {
    const hash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
    const existing = db.prepare("SELECT id FROM admin_users WHERE username = ?").get(ADMIN_USERNAME);
    if (existing) db.prepare("UPDATE admin_users SET password_hash = ? WHERE username = ?").run(hash, ADMIN_USERNAME);
    else db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run(ADMIN_USERNAME, hash);
  }

  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  return db;
}

/** Koneksi database (dibuat sekali, dipakai ulang). */
export function getDb(): DB {
  if (!globalForDb.__pisangijoDb) globalForDb.__pisangijoDb = init();
  return globalForDb.__pisangijoDb;
}

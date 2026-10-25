// Membuat akun admin: npm run seed
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "app.db"));
db.exec(`CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);

const rl = readline.createInterface({ input: stdin, output: stdout });
console.log("=== Buat akun admin ===");
const username = ((await rl.question("Username [admin]: ")).trim()) || "admin";
const password = await rl.question("Password (min 8 karakter): ");
rl.close();

if (password.length < 8) { console.error("Password minimal 8 karakter."); process.exit(1); }
if (db.prepare("SELECT id FROM admin_users WHERE username = ?").get(username)) {
  console.error(`User "${username}" sudah ada.`); process.exit(1);
}
db.prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)").run(username, await bcrypt.hash(password, 12));
console.log(`Admin "${username}" dibuat. Login di /admin/login`);

import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

const COOKIE_NAME = "pisangijo.sid";
const MAX_AGE_MS = 1000 * 60 * 60 * 8; // 8 jam

export type SessionData = {
  adminId?: number;
  username?: string;
  userId?: number;
  userNama?: string;
};

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET belum diisi. Salin .env.example menjadi .env.local lalu isi nilainya.");
  return s;
}

// ID di database = HMAC(token). Jadi isi tabel sessions saja tidak cukup untuk membajak sesi.
function sessionId(token: string) {
  return crypto.createHmac("sha256", secret()).update(token).digest("hex");
}

/** Membuat sesi baru (sekaligus menghapus sesi lama = mencegah session fixation). */
export async function createSession(data: SessionData) {
  const jar = await cookies();
  const old = jar.get(COOKIE_NAME)?.value;
  const db = getDb();
  if (old) db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId(old));

  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + MAX_AGE_MS;
  db.prepare("INSERT INTO sessions (id, data, expires_at) VALUES (?, ?, ?)").run(
    sessionId(token),
    JSON.stringify(data),
    expires
  );
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: MAX_AGE_MS / 1000,
  });
}

export async function getSession(): Promise<SessionData | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const row = getDb()
    .prepare("SELECT data, expires_at FROM sessions WHERE id = ?")
    .get(sessionId(token)) as { data: string; expires_at: number } | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  return JSON.parse(row.data) as SessionData;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(sessionId(token));
  jar.delete(COOKIE_NAME);
}

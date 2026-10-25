import { getDb } from "@/lib/db";
import { json } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function GET() {
  const s = await getSession();
  if (s?.userId) {
    const user = getDb()
      .prepare("SELECT nama, email, role, status, store_id FROM users WHERE id = ?")
      .get(s.userId);
    if (user) return json({ loggedIn: true, ...user });
  }
  return json({ loggedIn: false });
}

import { json } from "@/lib/http";
import { getSession } from "@/lib/session";

export async function GET() {
  const s = await getSession();
  return json(s?.adminId ? { loggedIn: true, username: s.username } : { loggedIn: false });
}

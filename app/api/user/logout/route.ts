import { json } from "@/lib/http";
import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();
  return json({ ok: true });
}

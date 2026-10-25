import { requireAdmin } from "@/lib/guards";
import { handleImageUpload } from "@/lib/upload";

export async function POST(req: Request) {
  const g = await requireAdmin();
  if (g instanceof Response) return g;
  return handleImageUpload(req, "store");
}

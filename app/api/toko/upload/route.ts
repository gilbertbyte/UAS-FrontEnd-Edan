import { requireToko } from "@/lib/guards";
import { handleImageUpload } from "@/lib/upload";

export async function POST(req: Request) {
  const g = await requireToko();
  if (g instanceof Response) return g;
  return handleImageUpload(req, "toko");
}

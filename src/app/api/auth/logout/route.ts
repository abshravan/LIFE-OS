import { clearAuthCookie } from "@/lib/auth/session";
import { ok } from "@/lib/api/response";

export async function POST() {
  await clearAuthCookie();
  return ok({ message: "Session terminated." });
}

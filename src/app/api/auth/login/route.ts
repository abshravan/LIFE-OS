import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";
import { ok, err, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, password: true },
    });

    // Constant-time comparison — always run verifyPassword to prevent timing attacks
    const passwordMatch = user
      ? await verifyPassword(password, user.password)
      : await verifyPassword(password, "$2b$12$invalidhashfortimingnormalization");

    if (!user || !passwordMatch) {
      return err("Invalid credentials. Verify your email and password.", 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    await setAuthCookie(token);

    return ok({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    return serverError(e);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/auth/validation";
import { ok, err, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { email, username, password } = parsed.data;

    // Check for existing user
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { email: true, username: true },
    });

    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return err(`This ${field} is already registered.`, 409);
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, username, password: hashed },
      select: { id: true, email: true, username: true },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    await setAuthCookie(token);

    return ok(
      { user: { id: user.id, email: user.email, username: user.username } },
      201
    );
  } catch (e) {
    return serverError(e);
  }
}

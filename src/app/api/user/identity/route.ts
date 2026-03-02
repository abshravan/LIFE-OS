import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { identitySchema } from "@/lib/auth/validation";
import { ok, err, unauthorized, serverError } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await requireSession();

    const identity = await prisma.identity.findUnique({
      where: { userId: session.userId },
    });

    return ok(identity);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = identitySchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { targetSelf, motivation } = parsed.data;

    const identity = await prisma.identity.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId, targetSelf, motivation },
      update: { targetSelf, motivation },
    });

    return ok(identity);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { excuseSchema } from "@/lib/auth/validation";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api/response";

// POST /api/excuse — log an excuse for a missed protocol
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = excuseSchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { protocolLogId, category, note } = parsed.data;

    // Verify the protocol log belongs to this user and is NOT completed
    const protocolLog = await prisma.protocolLog.findFirst({
      where: { id: protocolLogId, userId: session.userId },
    });

    if (!protocolLog) return notFound("Protocol log");

    if (protocolLog.completed) {
      return err("Cannot log an excuse for a completed protocol.", 409);
    }

    // Upsert excuse (user may update their excuse reason)
    const excuse = await prisma.excuse.upsert({
      where: { protocolLogId },
      create: { protocolLogId, category, note },
      update: { category, note },
    });

    return ok(excuse, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

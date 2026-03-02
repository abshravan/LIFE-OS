import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { ok, err, unauthorized, notFound, serverError } from "@/lib/api/response";

const completeSchema = z.object({
  protocolLogId: z.string().min(1),
  completed: z.boolean(),
});

// PATCH /api/daily-logs/complete — mark a protocol log as done/undone
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = completeSchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { protocolLogId, completed } = parsed.data;

    // Verify ownership
    const protocolLog = await prisma.protocolLog.findFirst({
      where: { id: protocolLogId, userId: session.userId },
    });

    if (!protocolLog) return notFound("Protocol log");

    const updated = await prisma.protocolLog.update({
      where: { id: protocolLogId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return ok(updated);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireSession } from "@/lib/auth/session";
import { protocolsBatchSchema } from "@/lib/auth/validation";
import { ok, err, unauthorized, serverError } from "@/lib/api/response";

// GET /api/protocols — list the user's active protocols
export async function GET() {
  try {
    const session = await requireSession();

    const protocols = await prisma.protocol.findMany({
      where: { userId: session.userId, isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, description: true, order: true, isActive: true },
    });

    return ok(protocols);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

// POST /api/protocols — create or replace user's protocol set (batch upsert)
export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const parsed = protocolsBatchSchema.safeParse(body);

    if (!parsed.success) {
      return err("Validation failed", 422, parsed.error.flatten().fieldErrors as Record<string, string[]>);
    }

    const { protocols } = parsed.data;

    // Deactivate all existing protocols, then create new ones
    // This preserves historical logs linked to old protocols
    await prisma.$transaction([
      prisma.protocol.updateMany({
        where: { userId: session.userId },
        data: { isActive: false },
      }),
      ...protocols.map((p) =>
        prisma.protocol.create({
          data: {
            userId: session.userId,
            name: p.name,
            description: p.description,
            order: p.order,
            isActive: true,
          },
        })
      ),
    ]);

    const updated = await prisma.protocol.findMany({
      where: { userId: session.userId, isActive: true },
      orderBy: { order: "asc" },
    });

    return ok(updated, 201);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return unauthorized();
    return serverError(e);
  }
}

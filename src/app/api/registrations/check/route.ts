import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/registrations/check?eventId=...
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ registered: false });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const reg = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id!,
          eventId,
        },
      },
      include: { team: true },
    });

    return NextResponse.json({
      registered: !!reg,
      teamId: reg?.teamId || null,
      teamCode: reg?.team?.teamCode || null,
    });
  } catch (error) {
    console.error("GET /api/registrations/check error:", error);
    return NextResponse.json({ error: "Check failed" }, { status: 500 });
  }
}

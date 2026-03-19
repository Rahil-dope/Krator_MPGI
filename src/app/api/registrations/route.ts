import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/registrations — fetch current user's registrations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: session.user.id },
      include: {
        event: true,
        team: {
          include: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/registrations error:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}

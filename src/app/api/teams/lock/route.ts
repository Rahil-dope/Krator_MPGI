import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/teams/lock — lock a team
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Only team leader can lock the team" }, { status: 403 });
    }

    const updated = await prisma.team.update({
      where: { id: teamId },
      data: { isLocked: true },
      include: { members: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/teams/lock error:", error);
    return NextResponse.json({ error: "Failed to lock team" }, { status: 500 });
  }
}

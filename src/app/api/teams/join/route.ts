import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/teams/join — join an existing team
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, memberDetails } = body;

    if (!teamId || !memberDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { members: true, event: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.isLocked) {
      return NextResponse.json({ error: "Team is locked" }, { status: 400 });
    }

    if (team.event && team.members.length >= team.event.maxTeamSize) {
      return NextResponse.json({ error: "Team is full" }, { status: 400 });
    }

    const existingReg = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id!,
          eventId: team.eventId,
        },
      },
    });
    if (existingReg) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    await prisma.teamMember.create({
      data: {
        teamId,
        userId: session.user.id,
        name: memberDetails.name,
        college: memberDetails.college,
        branch: memberDetails.branch,
        year: memberDetails.year,
        phone: memberDetails.phone,
        email: memberDetails.email || session.user.email || "",
      },
    });

    await prisma.registration.create({
      data: {
        userId: session.user.id!,
        eventId: team.eventId,
        teamId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/teams/join error:", error);
    return NextResponse.json({ error: "Failed to join team" }, { status: 500 });
  }
}

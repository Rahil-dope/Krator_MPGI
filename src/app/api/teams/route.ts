import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateTeamCode } from "@/lib/utils";

// GET /api/teams — get all teams (admin) or user's teams
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    if (all === "true") {
      if ((session.user as { role?: string }).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const teams = await prisma.team.findMany({
        include: { members: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(teams);
    }

    const registrations = await prisma.registration.findMany({
      where: { userId: session.user.id },
      include: {
        team: {
          include: { members: true },
        },
      },
    });
    const teams = registrations
      .map((r) => r.team)
      .filter(Boolean);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}

// POST /api/teams — create team
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, eventName, teamName, memberDetails } = body;

    if (!eventId || !teamName || !memberDetails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let teamCode = generateTeamCode();
    let existing = await prisma.team.findUnique({ where: { teamCode } });
    let attempts = 0;
    while (existing && attempts < 10) {
      teamCode = generateTeamCode();
      existing = await prisma.team.findUnique({ where: { teamCode } });
      attempts++;
    }

    const existingReg = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id!,
          eventId,
        },
      },
    });
    if (existingReg) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        teamName,
        teamCode,
        eventId,
        eventName: eventName || "",
        leaderId: session.user.id!,
        leaderEmail: session.user.email || "",
        members: {
          create: {
            userId: session.user.id,
            name: memberDetails.name,
            college: memberDetails.college,
            branch: memberDetails.branch,
            year: memberDetails.year,
            phone: memberDetails.phone,
            email: memberDetails.email || session.user.email || "",
          },
        },
      },
      include: { members: true },
    });

    await prisma.registration.create({
      data: {
        userId: session.user.id!,
        eventId,
        teamId: team.id,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}

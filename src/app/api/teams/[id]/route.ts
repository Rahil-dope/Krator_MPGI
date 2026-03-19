export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/teams/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: { members: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json(team);
  } catch (error) {
    console.error("GET /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

// PUT /api/teams/[id] — update team (admin or leader)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isAdmin = (session.user as { role?: string }).role === "admin";
    const isLeader = team.leaderId === session.user.id;
    if (!isAdmin && !isLeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.team.update({
      where: { id },
      data: body,
      include: { members: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/teams/[id] error:", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

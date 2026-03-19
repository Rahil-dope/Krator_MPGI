export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/teams/by-code/[code]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const team = await prisma.team.findUnique({
      where: { teamCode: code.toUpperCase() },
      include: {
        members: true,
        event: true,
      },
    });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
    return NextResponse.json(team);
  } catch (error) {
    console.error("GET /api/teams/by-code/[code] error:", error);
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/events — list all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events — create event (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const event = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description || "",
        category: body.category || "tech",
        minTeamSize: body.minTeamSize || 1,
        maxTeamSize: body.maxTeamSize || 2,
        isActive: body.isActive ?? true,
        icon: body.icon || null,
        rules: body.rules || [],
        prize: body.prize || null,
        venue: body.venue || null,
        coordinatorName: body.coordinatorName || null,
        coordinatorPhone: body.coordinatorPhone || null,
        feePerPerson: body.feePerPerson || null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

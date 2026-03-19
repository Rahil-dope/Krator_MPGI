export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/events/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// PUT /api/events/[id] (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const event = await prisma.event.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(event);
  } catch (error) {
    console.error("PUT /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/events/[id] (admin only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/events/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}

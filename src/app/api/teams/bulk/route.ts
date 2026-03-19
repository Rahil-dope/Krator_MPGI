import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/teams/bulk — bulk actions (admin only)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { teamIds, action, status: paymentStatus } = body;

    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: "No teams selected" }, { status: 400 });
    }

    if (action === "updatePayment" && paymentStatus) {
      await prisma.team.updateMany({
        where: { id: { in: teamIds } },
        data: { paymentStatus },
      });
    } else if (action === "checkIn") {
      await prisma.team.updateMany({
        where: { id: { in: teamIds } },
        data: { checkedIn: true, checkedInAt: new Date() },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/teams/bulk error:", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}

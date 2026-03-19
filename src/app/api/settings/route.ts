import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/settings — fetch global settings
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const config = settings.reduce((acc: Record<string, string>, s: { key: string, value: string }) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      registrationOpen: config.registrationOpen === "true",
      registrationDeadline: config.registrationDeadline || null,
      upiId: config.upiId || "",
      upiQR: config.upiQR || "",
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// PUT /api/settings — update global settings (admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const updates = [];

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        updates.push(
          prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) },
          })
        );
      }
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

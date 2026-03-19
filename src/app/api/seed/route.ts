import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DUMMY_EVENTS } from "@/lib/constants";

// POST /api/seed — populate database with default events
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existingEventsCount = await prisma.event.count();
    
    if (existingEventsCount === 0) {
      // Seed Events
      for (const event of DUMMY_EVENTS) {
        await prisma.event.create({
          data: {
            name: event.name,
            description: event.description,
            category: event.category,
            minTeamSize: event.minTeamSize,
            maxTeamSize: event.maxTeamSize,
            isActive: event.isActive,
            icon: event.icon,
            rules: event.rules,
            prize: event.prize,
            venue: event.venue,
            coordinatorName: event.coordinatorName,
            coordinatorPhone: event.coordinatorPhone,
          },
        });
      }

      // Seed default settings
      await prisma.setting.createMany({
        data: [
          { key: "registrationOpen", value: "true" },
          { key: "upiId", value: "8604738590@okbizaxis" },
        ],
        skipDuplicates: true,
      });

      return NextResponse.json({ message: "Database seeded successfully" });
    }

    return NextResponse.json({ message: "Database already contains events, skipping seed" });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}

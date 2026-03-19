import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
// No cloudinary imports needed here, assuming there is a separate cloudinary utility 
// However, the signature of uploadImage needs to return an object instead of string
import { uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/upload — upload images to Cloudinary
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'payment' or 'upiQR'
    const teamId = formData.get("teamId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const folder = type === "upiQR" ? "kratos/system" : "kratos/payments";
    const secure_url = await uploadImage(buffer, folder);

    if (type === "payment" && teamId) {
      const transactionId = formData.get("transactionId") as string;
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
      if (team.leaderId !== session.user.id) {
        return NextResponse.json({ error: "Only team leader can upload payment" }, { status: 403 });
      }

      await prisma.team.update({
        where: { id: teamId },
        data: {
          paymentProofUrl: secure_url,
          transactionId,
          paymentStatus: "pending", // Reset to pending when new proof uploaded
        },
      });
    } else if (type === "upiQR") {
      if ((session.user as { role?: string }).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      // Return the URL for the settings context to save
    }

    return NextResponse.json({ url: secure_url });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

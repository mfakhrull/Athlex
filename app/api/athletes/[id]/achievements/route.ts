import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    await connectDB();

    const athlete = await Athlete.findByIdAndUpdate(
      params.id,
      {
        $push: {
          achievements: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: request.headers.get("x-user-email") || "Unknown",
          },
        },
      },
      { new: true }
    );

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(athlete.achievements.slice(-1)[0]);
  } catch (error) {
    console.error("Error adding achievement:", error);
    return NextResponse.json(
      { message: "Failed to add achievement" },
      { status: 500 }
    );
  }
}
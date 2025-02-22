import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await request.json();
    
    await connectDB();

    const athlete = await Athlete.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(athlete);
  } catch (error) {
    console.error("Error updating athlete status:", error);
    return NextResponse.json(
      { message: "Failed to update athlete status" },
      { status: 500 }
    );
  }
}
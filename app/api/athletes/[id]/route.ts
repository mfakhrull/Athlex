import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const athlete = await Athlete.findById(params.id)
      .populate("team", "name color")
      .populate("ageClass", "name minAge maxAge")
      .populate("sports.sport", "name type");

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(athlete);
  } catch (error) {
    console.error("Error fetching athlete:", error);
    return NextResponse.json(
      { message: "Failed to fetch athlete" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    
    await connectDB();

    const athlete = await Athlete.findByIdAndUpdate(
      params.id,
      {
        ...data,
        updatedAt: new Date(),
        updatedBy: request.headers.get("x-user-email") || "Unknown",
      },
      { new: true, runValidators: true }
    );

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(athlete);
  } catch (error) {
    console.error("Error updating athlete:", error);
    return NextResponse.json(
      { message: "Failed to update athlete" },
      { status: 500 }
    );
  }
}
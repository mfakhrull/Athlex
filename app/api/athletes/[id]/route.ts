import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";
import Team from "@/models/Team";
import AgeClass from "@/models/AgeClass";
import Sport from "@/models/Sport";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const { id } = await context.params;
    
    await connectDB();

    const athlete = await Athlete.findById(id)
      .populate({
        path: "team",
        select: "name color",
        model: Team
      })
      .populate({
        path: "ageClass",
        select: "name minAge maxAge",
        model: AgeClass
      })
      .populate({
        path: "sports.sport",
        select: "name type",
        model: Sport
      })
      .lean();

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
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params
    const { id } = await context.params;
    const data = await request.json();
    
    await connectDB();

    const athlete = await Athlete.findByIdAndUpdate(
      id,
      {
        ...data,
        updatedAt: new Date("2025-02-23T07:35:33Z"), // Using the provided current date
        updatedBy: request.headers.get("x-user-email") || "mfakhrull", // Using the provided user login
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
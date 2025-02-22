import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sport from "@/models/Sport";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Check if sport name already exists for this school
    const existingSport = await Sport.findOne({
      schoolCode: body.schoolCode,
      name: body.name,
    });

    if (existingSport) {
      return NextResponse.json(
        { message: "A sport with this name already exists" },
        { status: 400 }
      );
    }

    // Validate maxPlayersPerTeam for team sports
    if (body.type === "team" && !body.maxPlayersPerTeam) {
      return NextResponse.json(
        { message: "Maximum players per team is required for team sports" },
        { status: 400 }
      );
    }

    const newSport = new Sport(body);
    await newSport.save();

    return NextResponse.json(newSport, { status: 201 });
  } catch (error) {
    console.error("Sport creation error:", error);
    return NextResponse.json(
      { message: "Failed to create sport" },
      { status: 500 }
    );
  }
}
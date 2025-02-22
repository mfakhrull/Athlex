import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    // Check if team name already exists for this school
    const existingTeam = await Team.findOne({
      schoolCode: body.schoolCode,
      name: body.name,
    });

    if (existingTeam) {
      return NextResponse.json(
        { message: "A team with this name already exists" },
        { status: 400 }
      );
    }

    const newTeam = new Team(body);
    await newTeam.save();

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Team creation error:", error);
    return NextResponse.json(
      { message: "Failed to create team" },
      { status: 500 }
    );
  }
}
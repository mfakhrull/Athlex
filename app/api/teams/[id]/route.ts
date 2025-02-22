import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    await connectDB();

    // Check if new name conflicts with existing team
    if (body.name) {
      const existingTeam = await Team.findOne({
        schoolCode: body.schoolCode,
        name: body.name,
        _id: { $ne: id },
      });

      if (existingTeam) {
        return NextResponse.json(
          { message: "A team with this name already exists" },
          { status: 400 }
        );
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Team update error:", error);
    return NextResponse.json(
      { message: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await connectDB();

    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return NextResponse.json(
        { message: "Team not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Team deletion error:", error);
    return NextResponse.json(
      { message: "Failed to delete team" },
      { status: 500 }
    );
  }
}
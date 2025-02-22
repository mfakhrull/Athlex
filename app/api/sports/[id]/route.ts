import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sport from "@/models/Sport";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    await connectDB();

    // Check if new name conflicts with existing sport
    if (body.name) {
      const existingSport = await Sport.findOne({
        schoolCode: body.schoolCode,
        name: body.name,
        _id: { $ne: id },
      });

      if (existingSport) {
        return NextResponse.json(
          { message: "A sport with this name already exists" },
          { status: 400 }
        );
      }
    }

    // Validate maxPlayersPerTeam for team sports
    if (body.type === "team" && !body.maxPlayersPerTeam) {
      return NextResponse.json(
        { message: "Maximum players per team is required for team sports" },
        { status: 400 }
      );
    }

    const updatedSport = await Sport.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    if (!updatedSport) {
      return NextResponse.json({ message: "Sport not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSport);
  } catch (error) {
    console.error("Sport update error:", error);
    return NextResponse.json(
      { message: "Failed to update sport" },
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

    // You might want to check if the sport is being used by any athletes before deleting
    const sport = await Sport.findByIdAndDelete(id);

    if (!sport) {
      return NextResponse.json({ message: "Sport not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Sport deleted successfully" });
  } catch (error) {
    console.error("Sport deletion error:", error);
    return NextResponse.json(
      { message: "Failed to delete sport" },
      { status: 500 }
    );
  }
}

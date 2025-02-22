import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Team from "@/models/Team";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolCode = searchParams.get("schoolCode");

    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const teams = await Team.find({ schoolCode }).sort({ name: 1 });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Teams fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}
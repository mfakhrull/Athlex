import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Season from "@/models/Season";

export async function GET(request: NextRequest) {
  try {
    const schoolCode = request.headers.get("x-school-code");

    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const currentSeason = await Season.findOne({
      schoolCode,
      isActive: true,
    }).lean();

    if (!currentSeason) {
      // If no active season, get the most recent one
      const latestSeason = await Season.findOne({ schoolCode })
        .sort({ startDate: -1 })
        .lean();

      if (!latestSeason) {
        return NextResponse.json(
          { message: "No seasons found" },
          { status: 404 }
        );
      }

      return NextResponse.json(latestSeason);
    }

    return NextResponse.json(currentSeason);
  } catch (error) {
    console.error("Error fetching current season:", error);
    return NextResponse.json(
      { message: "Failed to fetch current season" },
      { status: 500 }
    );
  }
}
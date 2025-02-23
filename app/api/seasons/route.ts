import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Season from "@/models/Season";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const schoolCode = request.nextUrl.searchParams.get("schoolCode");
    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    const seasons = await Season.find({ schoolCode })
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json(seasons);
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return NextResponse.json(
      { message: "Failed to fetch seasons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const schoolCode = request.headers.get("x-school-code");

    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // If this season is active, deactivate all other seasons
    if (data.isActive) {
      await Season.updateMany(
        { schoolCode },
        { $set: { isActive: false } }
      );
    }

    const season = await Season.create({
      ...data,
      schoolCode,
      createdBy: "mfakhrull",
      updatedBy: "mfakhrull",
    });

    return NextResponse.json(season);
  } catch (error) {
    console.error("Error creating season:", error);
    return NextResponse.json(
      { message: "Failed to create season" },
      { status: 500 }
    );
  }
}
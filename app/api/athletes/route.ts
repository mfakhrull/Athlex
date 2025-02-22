import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolCode = searchParams.get("schoolCode");

    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const athletes = await Athlete.find({ schoolCode })
      .populate("team", "name color")
      .populate("ageClass", "name")
      .populate("sports.sport", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(athletes);
  } catch (error) {
    console.error("Error fetching athletes:", error);
    return NextResponse.json(
      { message: "Failed to fetch athletes" },
      { status: 500 }
    );
  }
}
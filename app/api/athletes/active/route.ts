import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const schoolCode = searchParams.get("schoolCode");
    const team = searchParams.get("team");
    const ageClass = searchParams.get("ageClass");

    if (!schoolCode) {
      return NextResponse.json(
        { 
          message: "School code is required",
          timestamp: "2025-02-23 12:50:17",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {
      schoolCode,
      isActive: true,
    };

    if (team) query.team = team;
    if (ageClass) query.ageClass = ageClass;

    const athletes = await Athlete.find(query)
      .select("fullName athleteNumber gender ageClass image team")
      .populate("ageClass", "name code")
      .populate("team", "name color")
      .sort({ fullName: 1 })
      .lean();

    const transformedAthletes = athletes.map(athlete => ({
      _id: athlete._id,
      fullName: athlete.fullName,
      athleteNumber: athlete.athleteNumber,
      gender: athlete.gender,
      image: athlete.image || "",
      ageClass: {
        _id: athlete.ageClass._id,
        name: athlete.ageClass.name,
        code: athlete.ageClass.code,
      },
      team: {
        _id: athlete.team._id,
        name: athlete.team.name,
        color: athlete.team.color,
      },
    }));

    return NextResponse.json(transformedAthletes);
  } catch (error) {
    console.error("Error fetching active athletes:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch athletes",
        timestamp: "2025-02-23 12:50:17",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}
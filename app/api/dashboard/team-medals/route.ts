import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";
import Team from "@/models/Team";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get schoolCode from query params
    const searchParams = request.nextUrl.searchParams;
    const schoolCode = searchParams.get("schoolCode");

    if (!schoolCode) {
      return NextResponse.json(
        { error: "School code is required" },
        { status: 400 }
      );
    }

    // First, get all teams for the school
    const teams = await Team.find({ schoolCode });

    // Create a map of team IDs to their colors
    const teamColorMap = teams.reduce((acc, team) => {
      acc[team._id.toString()] = { name: team.name, color: team.color };
      return acc;
    }, {} as Record<string, { name: string; color: string }>);

    // Aggregate medal counts by team
    const medalCounts = await Athlete.aggregate([
      // Match athletes from the specified school
      { $match: { schoolCode } },
      // Unwind achievements to get one document per achievement
      { $unwind: "$achievements" },
      // Group by team and medal type
      {
        $group: {
          _id: "$team",
          gold: {
            $sum: {
              $cond: [{ $eq: ["$achievements.result.medal", "GOLD"] }, 1, 0],
            },
          },
          silver: {
            $sum: {
              $cond: [{ $eq: ["$achievements.result.medal", "SILVER"] }, 1, 0],
            },
          },
          bronze: {
            $sum: {
              $cond: [{ $eq: ["$achievements.result.medal", "BRONZE"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Format the response
    const teamMedals = medalCounts.map((count) => {
      const teamId = count._id.toString();
      const teamInfo = teamColorMap[teamId];
      return {
        _id: teamId,
        name: teamInfo?.name || "Unknown Team",
        color: teamInfo?.color || "#000000",
        medals: {
          gold: count.gold,
          silver: count.silver,
          bronze: count.bronze,
          total: count.gold + count.silver + count.bronze,
        },
      };
    });

    // Sort by total medals, then gold, then silver
    teamMedals.sort((a, b) => {
      if (b.medals.total !== a.medals.total) return b.medals.total - a.medals.total;
      if (b.medals.gold !== a.medals.gold) return b.medals.gold - a.medals.gold;
      return b.medals.silver - a.medals.silver;
    });

    return NextResponse.json(teamMedals);
  } catch (error) {
    console.error("Error fetching team medals:", error);
    return NextResponse.json(
      { error: "Failed to fetch team medals" },
      { status: 500 }
    );
  }
}
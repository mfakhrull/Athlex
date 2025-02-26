// app/api/dashboard/top-athletes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get schoolCode and limit from query params
    const searchParams = request.nextUrl.searchParams;
    const schoolCode = searchParams.get("schoolCode");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!schoolCode) {
      return NextResponse.json(
        { error: "School code is required" },
        { status: 400 }
      );
    }

    // Aggregate medal counts by athlete
    const topAthletes = await Athlete.aggregate([
      // Match athletes from the specified school
      { $match: { schoolCode, isActive: true } },
      // Unwind achievements to get one document per achievement
      { $unwind: { path: "$achievements", preserveNullAndEmptyArrays: false } },
      // Group by athlete
      {
        $group: {
          _id: "$_id",
          athleteNumber: { $first: "$athleteNumber" },
          fullName: { $first: "$fullName" },
          image: { $first: "$image" },
          ageClass: { $first: "$ageClass" },
          team: { $first: "$team" },
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
      // Add total medals field
      {
        $addFields: {
          totalMedals: { $sum: ["$gold", "$silver", "$bronze"] },
        },
      },
      // Sort by total medals and then by gold, silver, bronze
      {
        $sort: {
          totalMedals: -1,
          gold: -1,
          silver: -1,
          bronze: -1,
        },
      },
      // Limit to top N athletes
      { $limit: limit },
      // Populate references
      {
        $lookup: {
          from: "ageclasses",
          localField: "ageClass",
          foreignField: "_id",
          as: "ageClassInfo"
        }
      },
      {
        $lookup: {
          from: "teams",
          localField: "team",
          foreignField: "_id",
          as: "teamInfo"
        }
      },
      // Format the output
      {
        $project: {
          _id: 1,
          athleteNumber: 1,
          fullName: 1,
          image: 1,
          ageClass: { $arrayElemAt: ["$ageClassInfo.name", 0] },
          team: {
            name: { $arrayElemAt: ["$teamInfo.name", 0] },
            color: { $arrayElemAt: ["$teamInfo.color", 0] }
          },
          medals: {
            gold: "$gold",
            silver: "$silver",
            bronze: "$bronze",
            total: "$totalMedals"
          }
        }
      }
    ]);

    return NextResponse.json(topAthletes);
  } catch (error) {
    console.error("Error fetching top athletes:", error);
    return NextResponse.json(
      { error: "Failed to fetch top athletes" },
      { status: 500 }
    );
  }
}
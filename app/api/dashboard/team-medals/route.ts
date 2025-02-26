import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";
import Team from "@/models/Team";

export async function GET(request: NextRequest) {
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

    // Fetch all teams for this school
    const teams = await Team.find({ schoolCode, isActive: true });
    
    // Fetch all active athletes with their achievements and populate team info
    const athletes = await Athlete.find({ 
      schoolCode, 
      isActive: true,
      "achievements.0": { $exists: true } // Only athletes with at least one achievement
    }).populate("team");
    
    // Initialize team medals data structure
    const teamsMap = new Map();
    teams.forEach(team => {
      teamsMap.set(team._id.toString(), {
        _id: team._id.toString(),
        name: team.name,
        color: team.color || "#cccccc",
        medals: { gold: 0, silver: 0, bronze: 0, total: 0 }
      });
    });
    
    // Define Achievement interface
    interface Achievement {
      result?: {
        medal?: string;
      };
    }
    
    // Count medals from each athlete's achievements
    athletes.forEach(athlete => {
      if (!athlete.achievements) return;
      
      const teamId = athlete.team.toString();
      if (!teamsMap.has(teamId)) return;
      
      const teamData = teamsMap.get(teamId);
      
      athlete.achievements.forEach((achievement: Achievement) => {
        if (achievement.result && achievement.result.medal) {
          const medalType = achievement.result.medal.toLowerCase();
          if (medalType === "gold" || medalType === "silver" || medalType === "bronze") {
            teamData.medals[medalType]++;
            teamData.medals.total++;
          }
        }
      });
    });
    
    // Convert map to array and sort by medal count (gold first, then silver, then bronze)
    const teamRankings = Array.from(teamsMap.values()).sort((a, b) => {
      if (a.medals.gold !== b.medals.gold) return b.medals.gold - a.medals.gold;
      if (a.medals.silver !== b.medals.silver) return b.medals.silver - a.medals.silver;
      if (a.medals.bronze !== b.medals.bronze) return b.medals.bronze - a.medals.bronze;
      return b.medals.total - a.medals.total;
    });
    
    return NextResponse.json(teamRankings);
    
  } catch (error) {
    console.error("Error fetching team medals:", error);
    return NextResponse.json(
      { message: "Failed to fetch team medals data" },
      { status: 500 }
    );
  }
}
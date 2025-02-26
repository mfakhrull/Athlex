import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event, { EventDocument, RoundResult } from "@/models/Event";
import Athlete from "@/models/Athlete";
import mongoose from "mongoose";

interface EventParticipant {
  _id: mongoose.Types.ObjectId | string;
  athlete: string | { _id: string };
  ageClass: string;
  [key: string]: any;
}

interface EventRound {
  number: number;
  type: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  startTime: Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  qualifiedParticipantIds: string[];
  results: RoundResult[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const eventId = params.id;
    const event = await Event.findById(eventId)
      .populate("sport")
      .populate("season");
    
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Find the final round
    const finalRound = event.rounds?.find((round: EventRound) => round.type === "FINAL");
    
    if (!finalRound || !finalRound.results || finalRound.results.length === 0) {
      return NextResponse.json(
        { message: "Final round results not found" }, 
        { status: 400 }
      );
    }

    // Get medal winners (positions 1-3)
    const medalResults = finalRound.results
      .filter((result: RoundResult) => result.position && result.position <= 3)
      .sort((a: RoundResult, b: RoundResult) => (a.position || 0) - (b.position || 0));

    // Process each medal winner
    const updatePromises = medalResults.map(async (result: RoundResult) => {
      // Find the participant
      const participant = event.participants.find(
        (p: EventParticipant) => p._id.toString() === result.participantId
      );
      
      if (!participant) return null;
      
      // Get athlete ID
      const athleteId = typeof participant.athlete === "string" 
        ? participant.athlete 
        : participant.athlete._id;
        
      if (!athleteId) return null;

      // Rest of the function remains the same...
      let medalType = null;
      if (result.position === 1) medalType = "GOLD";
      else if (result.position === 2) medalType = "SILVER";
      else if (result.position === 3) medalType = "BRONZE";
      
      // Create achievement data
      const achievementData = {
        title: `${event.name} - ${medalType} Medal`,
        date: event.date,
        sport: event.sport._id || event.sport,
        season: event.season._id || event.season,
        tournament: {
          name: event.name,
          venue: event.venue,
          ageClass: participant.ageClass,
          level: "SEKOLAH", // Default level, could be configured based on event
        },
        result: {
          position: result.position,
          medal: medalType,
          points: result.points || 0,
          remarks: result.remarks || "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "mfakhrull",
        updatedBy: "mfakhrull",
      };

      // Update athlete with new achievement
      return Athlete.findByIdAndUpdate(
        athleteId,
        { $push: { achievements: achievementData } },
        { new: true }
      );
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises.filter(Boolean));

    return NextResponse.json({
      message: "Athlete achievements created successfully",
      timestamp: new Date().toISOString(),
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error creating achievements:", error);
    return NextResponse.json(
      { message: "Failed to create achievements" },
      { status: 500 }
    );
  }
}
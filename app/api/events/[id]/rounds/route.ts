import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { z } from "zod";

const roundRequestSchema = z.object({
  rounds: z.array(z.object({
    number: z.number().min(1),
    type: z.enum(["QUALIFYING", "QUARTERFINAL", "SEMIFINAL", "FINAL"]),
    startTime: z.string(),
    status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"]),
    qualifiedParticipantIds: z.array(z.string()).default([]),
  })),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    
    // Extract ID from URL pattern /api/events/{id}/rounds
    const id = request.url.split('/events/')[1].split('/rounds')[0];
    
    if (!id) {
      return NextResponse.json(
        {
          message: "Event ID is required",
          timestamp: new Date().toISOString(),
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    const validation = roundRequestSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: validation.error.errors,
          timestamp: "2025-02-24 07:49:06",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { 
          message: "Event not found",
          timestamp: "2025-02-24 07:49:06",
          user: "mfakhrull",
        }, 
        { status: 404 }
      );
    }

    // Initialize rounds array if it doesn't exist
    if (!event.rounds) {
      event.rounds = [];
    }

    // Handle each round in the request
    for (const newRound of validation.data.rounds) {
      const existingRoundIndex = event.rounds.findIndex(
        (        r: { number: number; }) => r.number === newRound.number
      );

      const roundData = {
        number: newRound.number,
        type: newRound.type,
        startTime: new Date(newRound.startTime),
        status: newRound.status,
        qualifiedParticipantIds: newRound.qualifiedParticipantIds,
        results: [], // Initialize empty results array for new rounds
      };

      if (existingRoundIndex === -1) {
        // Add new round
        event.rounds.push(roundData);
      } else {
        // Update existing round, preserving results
        const existingResults = event.rounds[existingRoundIndex].results || [];
        event.rounds[existingRoundIndex] = {
          ...roundData,
          results: existingResults,
        };
      }
    }

    // Sort rounds by number
    event.rounds.sort((a: { number: number; }, b: { number: number; }) => a.number - b.number);

    // Update event metadata
    event.updatedAt = new Date("2025-02-24 07:49:06");
    event.updatedBy = "mfakhrull";

    // Use markModified to ensure Mongoose detects the changes
    event.markModified('rounds');
    await event.save();

    return NextResponse.json({
      message: "Rounds updated successfully",
      timestamp: "2025-02-24 07:49:06",
      user: "mfakhrull",
      data: {
        rounds: event.rounds,
      },
    });
  } catch (error) {
    console.error("Error managing round:", error);
    return NextResponse.json(
      {
        message: "Failed to manage round",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: "2025-02-24 07:49:06",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}
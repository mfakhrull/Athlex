import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";
import "@/models/Team";
import "@/models/AgeClass";
import "@/models/Athlete";
import "@/models/Season";
import "@/models/Sport";

interface Round {
  number: number;
  type: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  startTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  qualifiedParticipantIds: Array<{
    _id: mongoose.Types.ObjectId;
    fullName: string;
    athleteNumber: string;
    gender: "L" | "P";
    ageClass: {
      _id: string;
      name: string;
    };
  }>;
  results?: Array<{
    participantId: string;
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  }>;
}

interface EventDocument {
  _id: string;
  rounds?: Round[];
}

interface ParticipantResponse {
  _id: string;
  fullName: string;
  athleteNumber: string;
  gender: "L" | "P";
  ageClass: {
    _id: string;
    name: string;
  };
  team: {
    _id: string;
    name: string;
    color: string;
  };
  result?: {
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; roundNumber: string } }
) {
  try {
    const { id, roundNumber } = await Promise.resolve(params);
    await connectDB();

    const event = await Event.findById<EventDocument>(id)
      .populate({
        path: "rounds.qualifiedParticipantIds",
        select: "fullName athleteNumber gender ageClass team",
        populate: [
          {
            path: "ageClass",
            select: "name",
          },
          {
            path: "team",
            select: "name color",
          },
        ],
      })
      .lean();

    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
          timestamp: "2025-02-25 04:04:59",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    const round = event.rounds?.find(
      (r: Round) => r.number === parseInt(roundNumber)
    );

    if (!round) {
      return NextResponse.json(
        {
          message: "Round not found",
          timestamp: "2025-02-25 04:04:59",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    // Map qualified participants with their results
    const qualifiedParticipants: ParticipantResponse[] =
      round.qualifiedParticipantIds.map((athlete: any) => ({
        _id: athlete._id,
        fullName: athlete.fullName,
        athleteNumber: athlete.athleteNumber,
        gender: athlete.gender,
        ageClass: athlete.ageClass,
        team: athlete.team,
        result: round.results?.find(
          (r: { participantId: any }) => r.participantId === athlete._id.toString()
        ),
      }));

    return NextResponse.json({
      participants: qualifiedParticipants,
      metadata: {
        roundType: round.type,
        roundNumber: round.number,
        roundStatus: round.status,
        startTime: round.startTime,
        timestamp: "2025-02-25 04:04:59",
        user: "mfakhrull",
      },
    });
  } catch (error) {
    console.error("Error fetching round participants:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch round participants",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: "2025-02-25 04:04:59",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; roundNumber: string } }
) {
  try {
    const { id, roundNumber } = await Promise.resolve(params);
    await connectDB();

    const data = await request.json();
    const { participantId, result } = data;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
          timestamp: "2025-02-25 04:04:59",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    const roundIndex = event.rounds?.findIndex(
      (r: { number: number }) => r.number === parseInt(roundNumber)
    );

    if (roundIndex === -1 || roundIndex === undefined) {
      return NextResponse.json(
        {
          message: "Round not found",
          timestamp: "2025-02-25 04:04:59",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    const rounds = event.rounds as Round[];
    const round = rounds[roundIndex];

    // Verify participant is qualified for this round
    const qualifiedParticipant = round.qualifiedParticipantIds.find(
      (p) => p._id.toString() === participantId
    );

    if (!qualifiedParticipant) {
      return NextResponse.json(
        {
          message: "Participant not qualified for this round",
          timestamp: "2025-02-25 04:04:59",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    // Update or add result
    const resultIndex = round.results?.findIndex(
      (r) => r.participantId === participantId
    );

    if (resultIndex === -1 || resultIndex === undefined) {
      // Add new result
      round.results = [
        ...(round.results || []),
        {
          participantId,
          ...result,
          createdAt: new Date("2025-02-25 04:04:59"),
          createdBy: "mfakhrull",
          updatedAt: new Date("2025-02-25 04:04:59"),
          updatedBy: "mfakhrull",
        },
      ];
    } else {
      const results = round.results as any[];
      results[resultIndex] = {
        ...results[resultIndex],
        ...result,
        updatedAt: new Date("2025-02-25 04:04:59"),
        updatedBy: "mfakhrull",
      };
    }

    event.markModified("rounds");
    await event.save();

    return NextResponse.json({
      message: "Participant result updated successfully",
      timestamp: "2025-02-25 04:04:59",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error updating participant result:", error);
    return NextResponse.json(
      {
        message: "Failed to update participant result",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: "2025-02-25 04:04:59",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}

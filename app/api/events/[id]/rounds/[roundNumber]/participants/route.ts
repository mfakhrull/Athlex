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
    createdAt?: Date;
    updatedAt?: Date;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; roundNumber: string } }
) {
  try {
    const { id, roundNumber } = await Promise.resolve(params);
    await connectDB();

    // Update the Event.findById query to include participants
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
      .select("participants rounds") // Add participants to the selection
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

    // Update the GET endpoint's participant mapping
    const qualifiedParticipants: ParticipantResponse[] =
      round.qualifiedParticipantIds.map((athlete: any) => {
        // Find the participant entry that matches this athlete
        const participant = event.participants?.find(
          (p: any) => p.athlete === athlete._id.toString()
        );

        // Find result using participant's _id
        const athleteResult =
          participant &&
          round.results?.find(
            (r: { participantId: string }) =>
              r.participantId === participant._id.toString()
          );

        return {
          _id: athlete._id,
          fullName: athlete.fullName,
          athleteNumber: athlete.athleteNumber,
          gender: athlete.gender,
          ageClass: athlete.ageClass,
          team: athlete.team,
          result: athleteResult
            ? {
                position: athleteResult.position,
                time: athleteResult.time,
                distance: athleteResult.distance,
                height: athleteResult.height,
                points: athleteResult.points,
                remarks: athleteResult.remarks,
                createdAt: athleteResult.createdAt,
                updatedAt: athleteResult.updatedAt,
              }
            : undefined,
        };
      });

    // Update the response to include round details
    return NextResponse.json({
      participants: qualifiedParticipants,
      metadata: {
        roundType: round.type,
        roundNumber: round.number,
        roundStatus: round.status,
        startTime: round.startTime,
        hasResults: round.results?.length > 0,
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
    const participant = event.participants?.find(
      (p: any) => p.athlete === participantId
    );
    
    if (!participant) {
      return NextResponse.json(
        {
          message: "Participant not found",
          timestamp: "2025-02-25 04:04:59",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    // Update or add result
    const resultIndex = round.results?.findIndex(
      (r) => r.participantId === participant._id.toString()
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

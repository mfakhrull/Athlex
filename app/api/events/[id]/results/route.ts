import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { z } from "zod";

// Define result schema
const resultSchema = z.object({
  participantId: z.string(),
  position: z.number().min(1).optional(),
  time: z
    .union([
      z.string().regex(
        /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)(?:\.(\d{1,3}))?$/,
        "Invalid time format"
      ),
      z.literal(""),
    ])
    .optional(),
  distance: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  points: z.number().min(0).optional(),
  remarks: z.string().optional(),
});

const resultsRequestSchema = z.object({
  results: z.array(resultSchema),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

type ResultsRequest = z.infer<typeof resultsRequestSchema>;

type ParticipantDoc = {
  _id: string;
  athlete?: {
    _id: string;
    fullName: string;
    athleteNumber: string;
  };
  category?: "L" | "P";
  result?: {
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  };
};

type EventDocWithParticipants = {
  participants: ParticipantDoc[];
  // ...existing code...
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const data = await request.json();
    const validation = resultsRequestSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: "Invalid data", 
          errors: validation.error.errors,
          timestamp: "2025-02-23 19:05:24",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { 
          message: "Event not found",
          timestamp: "2025-02-23 19:05:24",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    // Validate event status
    if (event.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { 
          message: "Results can only be recorded for events in progress",
          timestamp: "2025-02-23 19:05:24",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    // Update participant results
    validation.data.results.forEach((result) => {
      const participant = event.participants.find(
        (p: { _id: { toString: () => string; }; }) => p._id.toString() === result.participantId
      );

      if (participant) {
        participant.result = {
          position: result.position,
          time: result.time,
          distance: result.distance,
          height: result.height,
          points: result.points,
          remarks: result.remarks,
        };
        participant.updatedAt = new Date("2025-02-23 19:05:24");
        participant.updatedBy = "mfakhrull";
      }
    });

    event.updatedAt = new Date("2025-02-23 19:05:24");
    event.updatedBy = "mfakhrull";

    // Save the updated event
    await event.save();

    return NextResponse.json({
      message: "Results recorded successfully",
      timestamp: "2025-02-23 19:05:24",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error recording results:", error);
    return NextResponse.json(
      { 
        message: "Failed to record results",
        timestamp: "2025-02-23 19:05:24",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}

// Get results for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const event = await Event.findById(params.id)
      .select("participants.athlete participants.result participants.category")
      .populate("participants.athlete", "fullName athleteNumber")
      .lean<EventDocWithParticipants>();

    if (!event) {
      return NextResponse.json(
        { 
          message: "Event not found",
          timestamp: "2025-02-23 19:05:24",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    // Sort participants by position
    const sortedParticipants = event.participants
      .filter((p: ParticipantDoc) => p.result?.position !== undefined)
      .sort((a: ParticipantDoc, b: ParticipantDoc) => (a.result?.position || 0) - (b.result?.position || 0));

    return NextResponse.json({
      results: sortedParticipants,
      timestamp: "2025-02-23 19:05:24",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch results",
        timestamp: "2025-02-23 19:05:24",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}

// Update existing results
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const data = await request.json();
    const validation = resultsRequestSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: "Invalid data", 
          errors: validation.error.errors,
          timestamp: "2025-02-23 19:05:24",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { 
          message: "Event not found",
          timestamp: "2025-02-23 19:05:24",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    // Update participant results
    validation.data.results.forEach((result) => {
      const participant = event.participants.find(
        (p: { _id: { toString: () => string; }; }) => p._id.toString() === result.participantId
      );

      if (participant) {
        participant.result = {
          ...participant.result,
          ...result,
          updatedAt: new Date("2025-02-23 19:05:24"),
          updatedBy: "mfakhrull",
        };
      }
    });

    event.updatedAt = new Date("2025-02-23 19:05:24");
    event.updatedBy = "mfakhrull";

    await event.save();

    return NextResponse.json({
      message: "Results updated successfully",
      timestamp: "2025-02-23 19:05:24",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error updating results:", error);
    return NextResponse.json(
      { 
        message: "Failed to update results",
        timestamp: "2025-02-23 19:05:24",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}
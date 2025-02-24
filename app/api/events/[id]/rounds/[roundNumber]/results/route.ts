import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { z } from "zod";

const roundResultsSchema = z.object({
  results: z.array(z.object({
    participantId: z.string(),
    position: z.number().min(1).optional(),
    time: z.string().optional(),
    distance: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
    points: z.number().min(0).optional(),
    remarks: z.string().optional(),
  })),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; roundNumber: string } }
) {
  try {
    await connectDB();

    const data = await request.json();
    const validation = roundResultsSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: "Invalid data",
          errors: validation.error.errors,
          timestamp: "2025-02-24 04:48:32",
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
          timestamp: "2025-02-24 04:48:32",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    const roundIndex = event.rounds.findIndex(
        (      r: { number: { toString: () => string; }; }) => r.number.toString() === params.roundNumber
    );

    if (roundIndex === -1) {
      return NextResponse.json(
        { 
          message: "Round not found",
          timestamp: "2025-02-24 04:48:32",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    // Update round results
    event.rounds[roundIndex].results = validation.data.results.map(result => ({
      ...result,
      updatedAt: new Date("2025-02-24 04:48:32"),
      updatedBy: "mfakhrull",
    }));

    // If this is the final round, update event results
    if (event.rounds[roundIndex].type === "FINAL") {
      validation.data.results.forEach(result => {
        const participantIndex = event.participants.findIndex(
            (          p: { _id: { toString: () => string; }; }) => p._id.toString() === result.participantId
        );
        if (participantIndex !== -1) {
          event.participants[participantIndex].result = {
            ...result,
            updatedAt: new Date("2025-02-24 04:48:32"),
            updatedBy: "mfakhrull",
          };
        }
      });
    }

    event.updatedAt = new Date("2025-02-24 04:48:32");
    event.updatedBy = "mfakhrull";

    await event.save();

    return NextResponse.json({
      message: "Round results updated successfully",
      timestamp: "2025-02-24 04:48:32",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error updating round results:", error);
    return NextResponse.json(
      { 
        message: "Failed to update round results",
        timestamp: "2025-02-24 04:48:32",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}
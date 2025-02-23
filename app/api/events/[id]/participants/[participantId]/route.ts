import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { z } from "zod";

const updateParticipantSchema = z.object({
  status: z.enum([
    "REGISTERED",
    "CONFIRMED",
    "SCRATCHED",
    "DNS",
    "DNF",
    "DQ"
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { id, participantId } = await params;
    await connectDB();

    const data = await request.json();
    const validation = updateParticipantSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const event = await Event.findOneAndUpdate(
      {
        _id: id,
        "participants._id": participantId
      },
      {
        $set: {
          "participants.$.status": validation.data.status,
          "participants.$.updatedAt": new Date(),
          "participants.$.updatedBy": request.headers.get("x-user-email") || "system"
        }
      },
      { new: true }
    );

    if (!event) {
      return NextResponse.json(
        { message: "Event or participant not found" },
        { status: 404 }
      );
    }

    const updatedParticipant = event.participants.find(
      (p: { _id: { toString: () => string; }; }) => p._id.toString() === participantId
    );

    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { message: "Failed to update participant" },
      { status: 500 }
    );
  }
}

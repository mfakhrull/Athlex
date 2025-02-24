import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";
import { z } from "zod";

// Define interfaces for type safety
interface Heat {
  number: number;
  startTime: Date;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  participantIds: string[];
}

interface Participant {
  _id: mongoose.Types.ObjectId | string;
  heat?: number;
  updatedAt: Date;
  updatedBy: string;
}

// Define request schema
const heatRequestSchema = z.object({
  heats: z.array(
    z.object({
      number: z.number().min(1),
      startTime: z.string(), // Accept any string format
      status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"]),
      participantIds: z.array(z.string()).default([]), // Make participantIds optional with default empty array
    })
  ),
  updatedAt: z.string(),
  updatedBy: z.string(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const data = await request.json();
    const validation = heatRequestSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { 
            message: "Invalid data", 
            errors: validation.error.errors,
            details: {
              receivedData: data, // Log the received data for debugging
              timestamp: "2025-02-23 19:40:56",
              user: "mfakhrull",
            }
          },
        { status: 400 }
      );
    }

    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        {
          message: "Event not found",
          timestamp: "2025-02-23 19:32:55",
          user: "mfakhrull",
        },
        { status: 404 }
      );
    }

    // Reset all existing heat assignments
    event.participants.forEach((participant: Participant) => {
      participant.heat = undefined;
      participant.updatedAt = new Date("2025-02-23 19:32:55");
      participant.updatedBy = "mfakhrull";
    });

    // Update heats
    event.heats = validation.data.heats.map(heat => ({
        number: heat.number,
        startTime: new Date(heat.startTime), // Handle any valid date string
        status: heat.status,
      }));
      

    // Update participant heat assignments
    validation.data.heats.forEach((heat) => {
      heat.participantIds.forEach((participantId) => {
        const participant = event.participants.find(
          (p: Participant) => p._id.toString() === participantId
        );
        if (participant) {
          participant.heat = heat.number;
          participant.updatedAt = new Date("2025-02-23 19:32:55");
          participant.updatedBy = "mfakhrull";
        }
      });
    });

    event.updatedAt = new Date("2025-02-23 19:32:55");
    event.updatedBy = "mfakhrull";

    await event.save();

    return NextResponse.json({
      message: "Heats updated successfully",
      timestamp: "2025-02-23 19:32:55",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error updating heats:", error);
    return NextResponse.json(
        { 
            message: "Failed to process request",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: "2025-02-23 19:40:56",
            user: "mfakhrull",
          },
      { status: 500 }
    );
  }
}

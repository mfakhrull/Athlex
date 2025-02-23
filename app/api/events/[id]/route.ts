import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Sport from "@/models/Sport";
import Season from "@/models/Season";
import Athlete from "@/models/Athlete";
import AgeClass from "@/models/AgeClass";
import { z } from "zod";

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const event = await Event.findById(id)
      .populate("sport", "name")
      .populate("season", "name")
      .populate("participants.athlete", "fullName athleteNumber gender")
      .populate("participants.ageClass", "name");

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// Update schema for PATCH requests
const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  sport: z.string().optional(),
  season: z.string().optional(),
  ageClasses: z.array(z.string()).min(1).optional(),
  categories: z.array(z.enum(["L", "P"])).min(1).optional(),
  date: z.string().datetime().optional(),
  venue: z.string().min(1).optional(),
  type: z.enum(["TRACK", "FIELD", "RELAY", "CROSS_COUNTRY"]).optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED"]).optional(),
  updatedBy: z.string(),
});

// PATCH - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const data = await request.json();
    const validation = updateEventSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = {
      ...validation.data,
      updatedAt: new Date("2025-02-23T10:19:56Z"),
    };

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true,
        runValidators: true 
      }
    )
    .populate("sport", "name")
    .populate("season", "name");

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { message: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event can be deleted (only DRAFT events can be deleted)
    if (event.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Only draft events can be deleted" },
        { status: 400 }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { message: "Failed to delete event" },
      { status: 500 }
    );
  }
}
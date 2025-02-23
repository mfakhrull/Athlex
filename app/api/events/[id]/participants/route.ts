import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import Athlete from "@/models/Athlete";
import mongoose from "mongoose";

// Add participants to an event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    await connectDB();

    // Validate the event exists and can accept participants
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "DRAFT" && event.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Cannot modify participants for an event in progress or completed" },
        { status: 400 }
      );
    }

    // Validate participants data
    const { participants } = data;
    if (!Array.isArray(participants)) {
      return NextResponse.json(
        { message: "Invalid participants data" },
        { status: 400 }
      );
    }

    // Check if adding these participants would exceed maxParticipants
    if (event.participants.length + participants.length > event.maxParticipants) {
      return NextResponse.json(
        { message: "Adding these participants would exceed maximum allowed" },
        { status: 400 }
      );
    }

    // Validate each participant and prepare data
    const participantsData = participants.map(participant => ({
      ...participant,
      createdAt: new Date("2025-02-23T09:36:48Z"),
      createdBy: "mfakhrull",
      updatedAt: new Date("2025-02-23T09:36:48Z"),
      updatedBy: "mfakhrull",
    }));

    // Update the event with new participants
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $push: { participants: { $each: participantsData } },
        updatedAt: new Date("2025-02-23T09:36:48Z"),
        updatedBy: "mfakhrull",
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Participants added successfully",
      data: updatedEvent.participants
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    return NextResponse.json(
      { message: "Failed to add participants" },
      { status: 500 }
    );
  }
}

// Remove participants from an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { participantIds } = await request.json();
    
    await connectDB();

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "DRAFT" && event.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Cannot modify participants for an event in progress or completed" },
        { status: 400 }
      );
    }

    // Remove the participants
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        $pull: {
          participants: {
            _id: { $in: participantIds.map((pid: string) => new mongoose.Types.ObjectId(pid)) }
          }
        },
        updatedAt: new Date("2025-02-23T09:36:48Z"),
        updatedBy: "mfakhrull",
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Participants removed successfully",
      data: updatedEvent.participants
    });
  } catch (error) {
    console.error("Error removing participants:", error);
    return NextResponse.json(
      { message: "Failed to remove participants" },
      { status: 500 }
    );
  }
}

// Get participants for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const event = await Event.findById(id)
      .populate('participants.athlete', 'fullName athleteNumber gender ageClass')
      .populate('participants.ageClass', 'name');

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(event.participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { message: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
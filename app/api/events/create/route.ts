import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { z } from "zod";

// Validation schema for event creation
const createEventSchema = z.object({
  schoolCode: z.string().min(1, "School code is required"),
  name: z.string().min(1, "Event name is required"),
  sport: z.string().min(1, "Sport is required"),
  season: z.string().min(1, "Season is required"),
  ageClasses: z.array(z.string()).min(1, "At least one age class is required"),
  categories: z.array(z.enum(["L", "P"])).min(1, "At least one category is required"),
  date: z.string().datetime(),
  venue: z.string().min(1, "Venue is required"),
  type: z.enum(["TRACK", "FIELD", "RELAY", "CROSS_COUNTRY"]),
  status: z.enum(["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED"]),
  maxParticipants: z.number().min(1).max(1000),
  participants: z.array(z.any()).default([]),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data = await request.json();
    const validation = createEventSchema.safeParse(data);

    if (!validation.success) {
      return NextResponse.json(
        { 
          message: "Invalid data", 
          errors: validation.error.errors 
        },
        { status: 400 }
      );
    }

    // Check if event with same name exists for the school and sport
    const existingEvent = await Event.findOne({
      schoolCode: data.schoolCode,
      sport: data.sport,
      name: data.name,
    });

    if (existingEvent) {
      return NextResponse.json(
        { 
          message: "An event with this name already exists for this sport in your school" 
        },
        { status: 400 }
      );
    }

    const currentTimestamp = "2025-02-23T11:05:56Z";
    const currentUser = "User";

    const eventData = {
      ...validation.data,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      createdBy: currentUser,
      updatedBy: currentUser,
    };

    const event = await Event.create(eventData);

    // Populate references for the response
    const populatedEvent = await Event.findById(event._id)
      .populate("sport", "name code")
      .populate("season", "name")
      .populate("ageClasses", "name code");

    return NextResponse.json(populatedEvent, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);

    // Handle MongoDB unique index violation
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          message: "An event with this name already exists for this sport in your school" 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: "Failed to create event",
        error: error.message 
      },
      { status: 500 }
    );
  }
}
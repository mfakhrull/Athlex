import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";
import { z } from "zod";

// Create separate schemas for required and optional fields
const requiredFieldsSchema = z.object({
  athleteNumber: z.string().min(1, "Athlete number is required"),
  fullName: z.string().min(1, "Full name is required"),
  icNumber: z.string().length(12, "IC number must be 12 digits"),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(["L", "P"]),
  schoolCode: z.string().min(1, "School code is required"),
  team: z.string().min(1, "Team is required"),
  ageClass: z.string().min(1, "Age class is required"),
  sports: z.array(
    z.object({
      sport: z.string().min(1, "Sport is required"),
      isActive: z.boolean().default(true),
      joinedAt: z.string().or(z.date()).optional(),
    })
  ).min(1, "At least one sport is required"),
});

const optionalFieldsSchema = z.object({
  image: z.string().optional().nullable(),
  guardianName: z.string().optional().nullable(),
  guardianContact: z.string().optional().nullable(),
  guardianEmail: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  medicalConditions: z.array(z.string()).default([]),
  emergencyContact: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Combine both schemas for the complete athlete schema
const athleteSchema = requiredFieldsSchema.merge(optionalFieldsSchema);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the incoming data
    const validationResult = athleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid data",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate athlete number
    const existingAthleteNumber = await Athlete.findOne({
      schoolCode: body.schoolCode,
      athleteNumber: body.athleteNumber,
    });

    if (existingAthleteNumber) {
      return NextResponse.json(
        { message: "An athlete with this number already exists" },
        { status: 400 }
      );
    }

    // Check for duplicate IC number
    const existingIC = await Athlete.findOne({
      schoolCode: body.schoolCode,
      icNumber: body.icNumber,
    });

    if (existingIC) {
      return NextResponse.json(
        { message: "An athlete with this IC number already exists" },
        { status: 400 }
      );
    }

    // Clean up null values for optional fields
    const cleanedData = {
      ...body,
      image: body.image || undefined,
      guardianName: body.guardianName || undefined,
      guardianContact: body.guardianContact || undefined,
      guardianEmail: body.guardianEmail || undefined,
      address: body.address || undefined,
      emergencyContact: body.emergencyContact || undefined,
      medicalConditions: body.medicalConditions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create new athlete with cleaned data
    const newAthlete = new Athlete(cleanedData);
    await newAthlete.save();

    return NextResponse.json(newAthlete, { status: 201 });
  } catch (error) {
    console.error("Athlete creation error:", error);
    return NextResponse.json(
      { message: "Failed to create athlete" },
      { status: 500 }
    );
  }
}
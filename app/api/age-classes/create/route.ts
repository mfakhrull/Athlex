import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AgeClass from "@/models/AgeClass";
import { z } from "zod";

// Validation schema for age class creation
const ageClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  description: z.string().optional(),
  gender: z.enum(["L", "P"], {
    required_error: "Gender must be either 'L' (Male) or 'P' (Female)",
  }),
  minAge: z.number()
    .min(0, "Minimum age cannot be negative")
    .max(100, "Minimum age cannot exceed 100"),
  maxAge: z.number()
    .min(0, "Maximum age cannot be negative")
    .max(100, "Maximum age cannot exceed 100"),
  schoolCode: z.string().min(1, "School code is required"),
  isActive: z.boolean().default(true),
}).refine((data) => data.maxAge >= data.minAge, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["maxAge"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = ageClassSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Invalid data",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if age class with same name exists for this school
    const existingAgeClass = await AgeClass.findOne({
      schoolCode: body.schoolCode,
      name: body.name,
    });

    if (existingAgeClass) {
      return NextResponse.json(
        { message: "An age class with this name already exists" },
        { status: 400 }
      );
    }

    // Check for overlapping age ranges for same gender
    const overlappingAgeClass = await AgeClass.findOne({
      schoolCode: body.schoolCode,
      gender: body.gender,
      $or: [
        {
          // Check if min age falls within existing range
          minAge: { $lte: body.minAge },
          maxAge: { $gte: body.minAge }
        },
        {
          // Check if max age falls within existing range
          minAge: { $lte: body.maxAge },
          maxAge: { $gte: body.maxAge }
        },
        {
          // Check if range encompasses existing range
          minAge: { $gte: body.minAge },
          maxAge: { $lte: body.maxAge }
        }
      ]
    });

    if (overlappingAgeClass) {
      return NextResponse.json(
        { 
          message: `Age range overlaps with existing age class: ${overlappingAgeClass.name}`,
          overlappingClass: overlappingAgeClass
        },
        { status: 400 }
      );
    }

    // Create new age class
    const newAgeClass = new AgeClass({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newAgeClass.save();

    // Add audit log (if you have audit logging)
    // await AuditLog.create({
    //   action: 'create',
    //   model: 'AgeClass',
    //   documentId: newAgeClass._id,
    //   schoolCode: body.schoolCode,
    //   changes: body,
    //   performedBy: request.headers.get('user-id') || 'system',
    //   performedAt: new Date(),
    // });

    return NextResponse.json(newAgeClass, { status: 201 });

  } catch (error) {
    console.error("Age class creation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Validation error",
          errors: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create age class" },
      { status: 500 }
    );
  }
}
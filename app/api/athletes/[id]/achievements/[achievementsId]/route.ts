import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Athlete from "@/models/Athlete";
import mongoose from "mongoose";

interface Achievement {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  description?: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; achievementsId: string }> }
) {
  try {
    const { id, achievementsId } = await params;
    const validation = await validateRequest(request);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { message: validation.error },
        { status: 400 }
      );
    }

    await connectDB();

    const athleteObjectId = new mongoose.Types.ObjectId(id);
    const achievementObjectId = new mongoose.Types.ObjectId(achievementsId);

    const auditFields = {
      updatedAt: new Date("2025-02-23T08:44:02Z"),
      updatedBy: "mfakhrull"
    };

    const updatedData = {
      ...validation.data,
      ...auditFields,
      _id: achievementObjectId
    };

    const result = await Athlete.updateOne(
      {
        _id: athleteObjectId,
        "achievements._id": achievementObjectId
      },
      {
        $set: {
          "achievements.$": updatedData,
          updatedAt: auditFields.updatedAt,
          updatedBy: auditFields.updatedBy
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Achievement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Achievement updated successfully",
      data: updatedData
    });
  } catch (error) {
    console.error("Operation error:", error);
    
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update achievement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; achievementsId: string }> }
) {
  try {
    const { id, achievementsId } = await params;
    await connectDB();

    // Convert string IDs to MongoDB ObjectIds
    const athleteObjectId = new mongoose.Types.ObjectId(id);
    const achievementObjectId = new mongoose.Types.ObjectId(achievementsId);

    // Find and update the athlete document
    const result = await Athlete.updateOne(
      { _id: athleteObjectId },
      {
        $pull: {
          achievements: { _id: achievementObjectId }
        },
        $set: {
          updatedAt: new Date("2025-02-23T08:44:02Z"),
          updatedBy: "mfakhrull"
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Achievement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Achievement deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting achievement:", error);
    
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to delete achievement" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; achievementsId: string }> }
) {
  try {
    const { id, achievementsId } = await params;
    await connectDB();

    const athlete = await Athlete.findById(id);

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 404 }
      );
    }

    const achievement = athlete.achievements.find(
      (a: Achievement): boolean => a._id.toString() === achievementsId
    );

    if (!achievement) {
      return NextResponse.json(
        { message: "Achievement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.error("Error fetching achievement:", error);
    return NextResponse.json(
      { message: "Failed to fetch achievement" },
      { status: 500 }
    );
  }
}

// Utility type for achievement validation
interface AchievementData {
  title: string;
  date: Date;
  description?: string;
}

// Validation function for achievement data
function validateAchievementData(data: any): data is AchievementData {
  return (
    typeof data === "object" &&
    typeof data.title === "string" &&
    data.title.length > 0 &&
    data.date instanceof Date &&
    (data.description === undefined ||
      typeof data.description === "string")
  );
}

// Middleware to validate achievement data
async function validateRequest(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!validateAchievementData(data)) {
      return {
        isValid: false,
        error: "Invalid achievement data format",
      };
    }

    return {
      isValid: true,
      data,
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Invalid JSON data",
    };
  }
}

// Utility function to generate audit fields
function getAuditFields(request: NextRequest) {
  const now = new Date("2025-02-22T15:47:54Z"); // Using the provided current date
  const userLogin = "mfakhrull"; // Using the provided user login

  return {
    updatedAt: now,
    updatedBy: userLogin,
    createdAt: now,
    createdBy: userLogin,
  };
}

// Error handling utility
function handleError(error: unknown) {
  console.error("Operation error:", error);

  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json(
      {
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message),
      },
      { status: 400 }
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      { message: "Invalid ID format" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}


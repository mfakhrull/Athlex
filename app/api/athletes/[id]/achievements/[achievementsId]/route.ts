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

// Updated PUT method with better validation and error handling
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; achievementId: string } }
  ) {
    try {
      const validation = await validateRequest(request);
      
      if (!validation.isValid) {
        return NextResponse.json(
          { message: validation.error },
          { status: 400 }
        );
      }
  
      await connectDB();
  
      const auditFields = getAuditFields(request);
      const updatedData = {
        ...validation.data,
        ...auditFields,
        _id: params.achievementId,
      };
  
      const athlete = await Athlete.findOneAndUpdate(
        {
          _id: params.id,
          "achievements._id": params.achievementId,
        },
        {
          $set: {
            "achievements.$": updatedData,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
  
      if (!athlete) {
        return NextResponse.json(
          { message: "Achievement not found" },
          { status: 404 }
        );
      }
  
      const updatedAchievement = athlete.achievements.find(
        (a: Achievement): boolean => a._id.toString() === params.achievementId
    );
  
      return NextResponse.json({
        message: "Achievement updated successfully",
        data: updatedAchievement,
      });
    } catch (error) {
      return handleError(error);
    }
  }

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; achievementId: string } }
) {
  try {
    await connectDB();

    // Find the athlete and remove the achievement
    const athlete = await Athlete.findByIdAndUpdate(
      params.id,
      {
        $pull: {
          achievements: { _id: params.achievementId },
        },
      },
      { new: true }
    );

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete or achievement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Achievement deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return NextResponse.json(
      { message: "Failed to delete achievement" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; achievementId: string } }
) {
  try {
    await connectDB();

    const athlete = await Athlete.findById(params.id);

    if (!athlete) {
      return NextResponse.json(
        { message: "Athlete not found" },
        { status: 404 }
      );
    }

   

    const achievement = athlete.achievements.find(
      (a: Achievement): boolean => a._id.toString() === params.achievementId
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


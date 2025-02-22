import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Sport from "@/models/Sport";

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const schoolCode = searchParams.get("schoolCode");
  
      if (!schoolCode) {
        return NextResponse.json(
          { message: "School code is required" },
          { status: 400 }
        );
      }
  
      await connectDB();
      const sports = await Sport.find({ schoolCode })
        .populate('ageClasses') // Add this to populate age class data
        .sort({ name: 1 });
  
      return NextResponse.json(sports);
    } catch (error) {
      console.error("Sports fetch error:", error);
      return NextResponse.json(
        { message: "Failed to fetch sports" },
        { status: 500 }
      );
    }
  }
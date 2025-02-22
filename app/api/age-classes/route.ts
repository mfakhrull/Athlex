import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AgeClass from "@/models/AgeClass";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolCode = searchParams.get("schoolCode");
    const gender = searchParams.get("gender");
    const isActive = searchParams.get("isActive");

    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Build query
    const query: any = { schoolCode };
    
    if (gender) {
      query.gender = gender;
    }
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const ageClasses = await AgeClass.find(query).sort({
      gender: 1,
      minAge: 1,
      name: 1,
    });

    return NextResponse.json(ageClasses);
  } catch (error) {
    console.error("Age classes fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch age classes" },
      { status: 500 }
    );
  }
}
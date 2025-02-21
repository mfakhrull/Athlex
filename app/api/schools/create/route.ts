import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import School from "@/models/School";

export async function POST(request: Request) {
  try {
    const { name, schoolCode, logo, address, contactPerson, contactPhone, contactEmail } = await request.json();
    
    await connectDB();
    
    const newSchool = new School({
      name,
      schoolCode,
      logo,
      address,
      contact: {
        contactPerson,
        contactPhone,
        contactEmail,
      },
    });
    
    await newSchool.save();
    
    return NextResponse.json({ message: "School created successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
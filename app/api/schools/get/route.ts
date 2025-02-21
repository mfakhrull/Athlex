import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import School from "@/models/School"

export async function GET() {
  try {
    await connectDB()
    const schools = await School.find({})
    return NextResponse.json(schools)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import "@/models/Team";
import "@/models/AgeClass";
import "@/models/Sport";

// GET events with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const schoolCode = searchParams.get("schoolCode");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validate required parameters
    if (!schoolCode) {
      return NextResponse.json(
        { message: "School code is required" },
        { status: 400 }
      );
    }

    // Build query
    const query: any = { schoolCode };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (type && type !== "ALL") {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Execute query with pagination
    const [events, totalCount] = await Promise.all([
      Event.find(query)
        .populate("sport", "name")
        .populate("season", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Event.countDocuments(query),
    ]);

    // Add metadata for client-side pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents: totalCount,
        hasNextPage,
        hasPreviousPage,
        limit,
      },
      metadata: {
        timestamp: "2025-02-23T10:29:27Z",
        user: "mfakhrull",
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch events",
        timestamp: "2025-02-23T10:29:27Z",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}

// POST endpoint for bulk operations (if needed)
export async function POST(request: NextRequest) {
    try {
      await connectDB();
  
      const data = await request.json();
      const { operation, schoolCode, eventIds } = data;
  
      if (!schoolCode || !operation || !eventIds) {
        return NextResponse.json(
          { 
            message: "Missing required parameters",
            timestamp: "2025-02-23T10:29:27Z",
            user: "mfakhrull",
          },
          { status: 400 }
        );
      }
  
      let result;
  
      switch (operation) {
        case "bulk_status_update":
          const { newStatus } = data;
          if (!newStatus) {
            return NextResponse.json(
              { message: "New status is required for bulk status update" },
              { status: 400 }
            );
          }
  
          result = await Event.updateMany(
            {
              _id: { $in: eventIds },
              schoolCode,
            },
            {
              $set: {
                status: newStatus,
                updatedAt: new Date("2025-02-23T10:29:27Z"),
                updatedBy: "mfakhrull",
              },
            }
          );
          break;
  
        case "bulk_delete":
          // Only allow deletion of DRAFT events
          result = await Event.deleteMany({
            _id: { $in: eventIds },
            schoolCode,
            status: "DRAFT",
          });
          break;
  
        default:
          return NextResponse.json(
            { message: "Invalid operation" },
            { status: 400 }
          );
      }
  
      return NextResponse.json({
        message: "Bulk operation completed successfully",
        result,
        metadata: {
          timestamp: "2025-02-23T10:29:27Z",
          user: "mfakhrull",
        },
      });
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      return NextResponse.json(
        {
          message: "Failed to perform bulk operation",
          timestamp: "2025-02-23T10:29:27Z",
          user: "mfakhrull",
        },
        { status: 500 }
      );
    }
  }
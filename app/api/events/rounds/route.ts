import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";
import { startOfDay, endOfDay } from "date-fns";
import { Round, EventType, RoundSchedule } from "@/types/event";

// Define interface for the Event structure we need in this API
interface EventWithRounds {
  _id: string;
  name: string;
  type: EventType;
  venue: string;
  rounds?: Round[];
  sport: {
    name: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const schoolCode = searchParams.get("schoolCode");
    const date = searchParams.get("date");
    const eventId = searchParams.get("eventId");

    if (!schoolCode || !date) {
      return NextResponse.json(
        { 
          message: "Missing required parameters",
          timestamp: "2025-02-24 10:14:25",
          user: "mfakhrull",
        },
        { status: 400 }
      );
    }

    const startDate = startOfDay(new Date(date));
    const endDate = endOfDay(new Date(date));

    const query: any = {
      schoolCode,
      "rounds.startTime": {
        $gte: startDate,
        $lte: endDate,
      },
    };

    if (eventId && eventId !== "all") {
      query._id = eventId;
    }

    const events = (await Event.find(query)
      .populate("sport", "name")
      .lean()) as unknown as EventWithRounds[];

      const rounds: RoundSchedule[] = events.flatMap(event =>
        event.rounds
          ?.filter((round: Round) =>
            new Date(round.startTime) >= startDate &&
            new Date(round.startTime) <= endDate
          )
          .map((round: Round): RoundSchedule => ({
            eventId: event._id,
            eventName: event.name,
            type: event.type,
            roundNumber: round.number,
            roundType: round.type,
            startTime: round.startTime,
            status: round.status,
            venue: event.venue,
          })) || []
      );

    return NextResponse.json({
      rounds,
      timestamp: "2025-02-24 10:14:25",
      user: "mfakhrull",
    });
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return NextResponse.json(
      { 
        message: "Failed to fetch rounds",
        timestamp: "2025-02-24 10:14:25",
        user: "mfakhrull",
      },
      { status: 500 }
    );
  }
}
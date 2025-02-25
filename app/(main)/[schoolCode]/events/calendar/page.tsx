"use client";

import { use, useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  MapPin,
  Medal,
  Users,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Event {
  _id: string;
  name: string;
  type: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
}

interface EventRound {
  eventId: string;
  eventName: string;
  type: string;
  roundNumber: number;
  roundType: string;
  startTime: string;
  status: string;
  venue: string;
  qualifiedParticipants?: Array<{
    ageClass: any;
    _id: string;
    fullName: string;
    athleteNumber: string;
    category: string;
  }>;
}

interface FilterOptions {
  eventType: "ALL" | "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  roundType: "ALL" | "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  status: "ALL" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
}

export default function EventCalendarPage({ params }: { params: Promise<{ schoolCode: string }> }) {
  const { schoolCode } = use(params);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedRound, setSelectedRound] = useState<EventRound | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    eventType: "ALL",
    roundType: "ALL",
    status: "ALL",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchRounds();
  }, [selectedDate, selectedEvent, schoolCode, filters]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/events/event-list?schoolCode=${schoolCode}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      toast.error("Error loading events");
    }
  };

  const fetchRounds = async () => {
    try {
      const queryParams = new URLSearchParams({
        schoolCode,
        date: format(selectedDate, "yyyy-MM-dd"),
        eventId: selectedEvent,
        ...(filters.eventType !== "ALL" && { eventType: filters.eventType }),
        ...(filters.roundType !== "ALL" && { roundType: filters.roundType }),
        ...(filters.status !== "ALL" && { status: filters.status }),
      });

      const response = await fetch(`/api/events/rounds?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setRounds(data.rounds);
      }
    } catch (error) {
      toast.error("Error loading rounds");
    }
  };

  const fetchParticipants = async (eventId: string, roundNumber: number) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/rounds/${roundNumber}/participants`
      );
      if (response.ok) {
        const data = await response.json();
        return data.participants;
      }
    } catch (error) {
      toast.error("Error loading participants");
    }
    return [];
  };

  const handleRoundClick = async (round: EventRound) => {
    const participants = await fetchParticipants(round.eventId, round.roundNumber);
    setSelectedRound({
      ...round,
      qualifiedParticipants: participants,
    });
    setShowParticipants(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "TRACK":
        return "🏃";
      case "FIELD":
        return "🎯";
      case "RELAY":
        return "🏃‍♂️";
      case "CROSS_COUNTRY":
        return "🏃‍♀️";
      default:
        return "🎯";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Event Calendar</h1>
        <div className="flex items-center gap-4">
          <Select
            value={selectedEvent}
            onValueChange={setSelectedEvent}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Event Type
                </label>
                <Select
                  value={filters.eventType}
                  onValueChange={(value: FilterOptions["eventType"]) =>
                    setFilters({ ...filters, eventType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="TRACK">Track</SelectItem>
                    <SelectItem value="FIELD">Field</SelectItem>
                    <SelectItem value="RELAY">Relay</SelectItem>
                    <SelectItem value="CROSS_COUNTRY">Cross Country</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Round Type
                </label>
                <Select
                  value={filters.roundType}
                  onValueChange={(value: FilterOptions["roundType"]) =>
                    setFilters({ ...filters, roundType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Rounds</SelectItem>
                    <SelectItem value="QUALIFYING">Qualifying</SelectItem>
                    <SelectItem value="QUARTERFINAL">Quarter Final</SelectItem>
                    <SelectItem value="SEMIFINAL">Semi Final</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value: FilterOptions["status"]) =>
                    setFilters({ ...filters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card>
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                components={{
                  DayContent: (props) => {
                    const hasEvents = rounds.some(
                      (round) => isSameDay(new Date(round.startTime), props.date)
                    );
                    return (
                      <div
                        className={`relative ${
                          hasEvents ? "font-bold text-primary" : ""
                        }`}
                      >
                        {props.date.getDate()}
                        {hasEvents && (
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Events for {format(selectedDate, "MMMM d, yyyy")}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rounds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events scheduled for this date
                  </div>
                ) : (
                  rounds.map((round) => (
                    <Card key={`${round.eventId}-${round.roundNumber}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{getEventTypeIcon(round.type)}</span>
                            <span>{round.eventName}</span>
                          </div>
                          <Badge variant={getStatusBadgeVariant(round.status)}>
                            {round.status}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {round.roundType} (#{round.roundNumber})
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {format(new Date(round.startTime), "p")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{round.venue}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRoundClick(round)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Participants
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRound?.eventName} - {selectedRound?.roundType} Participants
            </DialogTitle>
            <DialogDescription>
              List of qualified participants for this round
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {selectedRound?.qualifiedParticipants?.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{participant.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {participant.athleteNumber} • {participant.ageClass.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
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
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    team: {
      _id: string;
      name: string;
      color: string;
    };
    result?: {
      position?: string | number;
      time?: string ;
    };
  }>;
}

interface FilterOptions {
  eventType: "ALL" | "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  roundType: "ALL" | "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  status: "ALL" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
}

export default function EventCalendarPage({
  params,
}: {
  params: Promise<{ schoolCode: string }>;
}) {
  const { schoolCode } = use(params);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [allRounds, setAllRounds] = useState<EventRound[]>([]);
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
  }, [schoolCode]);

  useEffect(() => {
    fetchRounds();
  }, [selectedDate, schoolCode]);

  useEffect(() => {
    const filtered = allRounds
      .filter(
        (round) => selectedEvent === "all" || round.eventId === selectedEvent
      )
      .filter(
        (round) =>
          filters.eventType === "ALL" || round.type === filters.eventType
      )
      .filter(
        (round) =>
          filters.roundType === "ALL" || round.roundType === filters.roundType
      )
      .filter(
        (round) => filters.status === "ALL" || round.status === filters.status
      );
    setRounds(filtered);
  }, [allRounds, selectedEvent, filters]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `/api/events/event-list?schoolCode=${schoolCode}`
      );
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
      });

      const response = await fetch(`/api/events/rounds?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setAllRounds(data.rounds);
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
    const participants = await fetchParticipants(
      round.eventId,
      round.roundNumber
    );
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
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Event Calendar
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full sm:w-[250px] bg-background">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event._id} value={event._id}>
                  {getEventTypeIcon(event.type)} {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-full sm:w-auto transition-colors",
              showFilters && "bg-primary text-primary-foreground"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Event Type
                  </label>
                  <Select
                    value={filters.eventType}
                    onValueChange={(value: FilterOptions["eventType"]) =>
                      setFilters({ ...filters, eventType: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Types</SelectItem>
                      <SelectItem value="TRACK">Track</SelectItem>
                      <SelectItem value="FIELD">Field</SelectItem>
                      <SelectItem value="RELAY">Relay</SelectItem>
                      <SelectItem value="CROSS_COUNTRY">
                        Cross Country
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    Round Type
                  </label>
                  <Select
                    value={filters.roundType}
                    onValueChange={(value: FilterOptions["roundType"]) =>
                      setFilters({ ...filters, roundType: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Rounds</SelectItem>
                      <SelectItem value="QUALIFYING">Qualifying</SelectItem>
                      <SelectItem value="QUARTERFINAL">
                        Quarter Final
                      </SelectItem>
                      <SelectItem value="SEMIFINAL">Semi Final</SelectItem>
                      <SelectItem value="FINAL">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value: FilterOptions["status"]) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger className="w-full">
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
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6 px-2 sm:px-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md mx-auto"
                components={{
                  DayContent: (props) => {
                    const hasEvents = rounds.some((round) =>
                      isSameDay(new Date(round.startTime), props.date)
                    );
                    return (
                      <div
                        className={cn(
                          "relative flex items-center justify-center w-full h-full p-0",
                          hasEvents && "font-bold"
                        )}
                      >
                        {props.date.getDate()}
                        {hasEvents && (
                          <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-base md:text-lg">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  Events for {format(selectedDate, "MMMM d, yyyy")}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-4">
                {rounds.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    No events scheduled for this date
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {rounds.map((round, index) => (
                      <motion.div
                        key={`${round.eventId}-${round.roundNumber}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                          <CardHeader className="pb-2 px-4 sm:px-6">
                            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">
                                  {getEventTypeIcon(round.type)}
                                </span>
                                <span className="font-semibold text-base sm:text-lg">
                                  {round.eventName}
                                </span>
                              </div>
                              <Badge
                                variant={getStatusBadgeVariant(round.status)}
                                className="text-xs px-3 py-1"
                              >
                                {round.status}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="px-4 sm:px-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              <div className="flex items-center gap-2">
                                <Medal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {round.roundType} (#{round.roundNumber})
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {format(new Date(round.startTime), "p")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:col-span-2">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {round.venue}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRoundClick(round)}
                              className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {round.status === "COMPLETED"
                                ? "View Results"
                                : "View Participants"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <span className="text-2xl">
                {getEventTypeIcon(selectedRound?.type || "")}
              </span>
              {selectedRound?.eventName} - {selectedRound?.roundType}
            </DialogTitle>
            <DialogDescription>
              Qualified participants for this round
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 px-1">
              {selectedRound?.qualifiedParticipants?.map(
                (participant, index) => (
                  <motion.div
                    key={participant._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 sm:p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{participant.fullName}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{participant.athleteNumber}</span>
                          <span>•</span>
                          <span>{participant.ageClass.name}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: participant.team.color,
                              }}
                            />
                            <span>{participant.team.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedRound.status === "COMPLETED" &&
                          participant.result && (
                            <Badge variant="secondary" className="mr-1">
                              {participant.result.position
                                ? `Position: ${participant.result.position}`
                                : "No position"}
                            </Badge>
                          )}
                        {(selectedRound.type === "TRACK" || selectedRound.type === "RELAY" || selectedRound.type === "CROSS_COUNTRY") && 
                         selectedRound.status === "COMPLETED" ? (
                          <Badge variant="outline" className="text-xs">
                          {participant.result?.time || "No time recorded"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {participant.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

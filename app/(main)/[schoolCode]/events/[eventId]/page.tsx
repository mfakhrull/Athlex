"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ParticipantsList } from "@/components/event-participants/participants-list";
import {
  AddParticipantsDialog,
  generateParticipantData,
} from "@/components/event-participants/add-participants-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, Medal, Users } from "lucide-react";

import { ManageResultsDialog } from "@/components/event-results/manage-results-dialog";
import { EventStatistics } from "@/components/event-statistics/event-stats";
import { ManageHeatDialog } from "@/components/event-heats/manage-heat-dialog";
import { ManageRoundDialog } from "@/components/event-rounds/manage-round-dialog";
import { ManageRoundResultsButton } from "@/components/event-rounds/manage-round-results-button";

interface Participant {
  _id: string;
  athlete: {
    _id: string;
    fullName: string;
    athleteNumber: string;
    gender: "L" | "P";
  };
  ageClass: {
    _id: string;
    name: string;
  };
  number: string;
  category: "L" | "P";
  lane?: number;
  order?: number;
  heat?: number;
  round?: number;
  status: "REGISTERED" | "CONFIRMED" | "SCRATCHED" | "DNS" | "DNF" | "DQ";
  result?: {
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface Athlete {
  _id: string;
  fullName: string;
  athleteNumber: string;
  gender: "L" | "P";
  image: string;
  ageClass: {
    _id: string;
    name: string;
    code: string;
  };
  team: {
    _id: string;
    name: string;
    color: string;
  };
}

interface Event {
  _id: string;
  name: string;
  sport: {
    _id: string;
    name: string;
  };
  date: string;
  venue: string;
  type: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  status: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED";
  maxParticipants: number;
  participants: Participant[];
  heats?: {
    number: number;
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  }[];
  rounds?: {
    number: number;
    type: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
    qualifiedParticipantIds: string[];
    results?: {
      participantId: string;
      position?: number;
      time?: string;
      distance?: number;
      height?: number;
      points?: number;
      remarks?: string;
    }[];
  }[];
}
interface EventPageProps {
  params: Promise<{
    schoolCode: string;
    eventId: string;
  }>;
}

export default function EventPage({ params }: EventPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [formattedDates, setFormattedDates] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");

  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [showHeatDialog, setShowHeatDialog] = useState(false);
  const [showRoundDialog, setShowRoundDialog] = useState(false);
  const [selectedHeat, setSelectedHeat] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  useEffect(() => {
    fetchEventDetails();
  }, [resolvedParams.eventId]);

  useEffect(() => {
    if (event) {
      // Format all dates at once after component mounts
      const dates: {[key: string]: string} = {};
      
      if (event.date && !isNaN(new Date(event.date).getTime())) {
        dates.eventDate = format(new Date(event.date), "PPP");
      }

      if (event.heats) {
        event.heats.forEach(heat => {
          if (heat.startTime && !isNaN(new Date(heat.startTime).getTime())) {
            dates[`heat${heat.number}`] = format(new Date(heat.startTime), "PPp");
          }
        });
      }

      if (event.rounds) {
        event.rounds.forEach(round => {
          if (round.startTime && !isNaN(new Date(round.startTime).getTime())) {
            dates[`round${round.number}`] = format(new Date(round.startTime), "PPp");
          }
        });
      }

      setFormattedDates(dates);
    }
  }, [event]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`/api/events/${resolvedParams.eventId}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        toast.error("Failed to fetch event details");
      }
    } catch (error) {
      toast.error("Error loading event details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipants = async (selectedAthletes: Athlete[]) => {
    try {
      const nextNumber = (event?.participants?.length || 0) + 1;
      const participantsData = selectedAthletes.map((athlete, index) =>
        generateParticipantData(athlete, event!._id, nextNumber + index)
      );

      const response = await fetch(
        `/api/events/${resolvedParams.eventId}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": "mfakhrull",
          },
          body: JSON.stringify({ participants: participantsData }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add participants");
      }

      toast.success("Participants added successfully");
      fetchEventDetails();
    } catch (error) {
      toast.error("Error adding participants");
    }
  };

  const handleStatusChange = async (
    participantId: string,
    newStatus: Participant["status"]
  ) => {
    try {
      const response = await fetch(
        `/api/events/${resolvedParams.eventId}/participants/${participantId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": "mfakhrull",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      fetchEventDetails();
    } catch (error) {
      throw error;
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      const response = await fetch(
        `/api/events/${resolvedParams.eventId}/participants`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": "mfakhrull",
          },
          body: JSON.stringify({ participantIds: [participantId] }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove participant");
      }

      fetchEventDetails();
    } catch (error) {
      throw error;
    }
  };

  const getQualifiedParticipantCount = (roundType: string) => {
    switch (roundType) {
      case "QUALIFYING":
        return 16;
      case "QUARTERFINAL":
        return 8;
      case "SEMIFINAL":
        return 4;
      case "FINAL":
        return 3;
      default:
        return 0;
    }
  };

  const getRoundTypeLabel = (type: string) => {
    switch (type) {
      case "QUALIFYING":
        return "Qualifying Round";
      case "QUARTERFINAL":
        return "Quarter Finals";
      case "SEMIFINAL":
        return "Semi Finals";
      case "FINAL":
        return "Finals";
      default:
        return type;
    }
  };
  const handleHeatsUpdate = async (heats: Event["heats"]) => {
    try {
      // Transform the heats data to match the API schema
      const formattedHeats =
        heats?.map((heat) => ({
          number: heat.number,
          startTime: new Date(heat.startTime).toISOString(), // Convert to ISO string
          status: heat.status,
          participantIds: [], // Add participant IDs if available
        })) || [];

      const response = await fetch(
        `/api/events/${resolvedParams.eventId}/heats`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": "mfakhrull",
          },
          body: JSON.stringify({
            heats: formattedHeats,
            updatedAt: "2025-02-23 19:40:56",
            updatedBy: "mfakhrull",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update heats");
      }

      await fetchEventDetails();
      toast.success("Heats updated successfully");
    } catch (error) {
      console.error("Error updating heats:", error);
      toast.error("Error updating heats");
    }
  };

  const handleRoundsUpdate = async (rounds: NonNullable<Event["rounds"]>) => {
    try {
      // Convert participant _ids to athlete string IDs
      const athleteIds = rounds[0].qualifiedParticipantIds.map((participantId) => {
        const participant = event?.participants.find((p) => p._id === participantId);
  
        // If participant.athlete is a string, use that;
        // If participant.athlete is an object, use participant.athlete._id
        // Otherwise, just return participantId (fallback)
        if (typeof participant?.athlete === "string") {
          return participant.athlete;
        } else if (participant?.athlete && typeof participant.athlete._id === "string") {
          return participant.athlete._id;
        }
        return participantId;
      });
  
      const formattedRounds = [
        {
          number: rounds[0].number,
          type: rounds[0].type,
          startTime: new Date(rounds[0].startTime).toISOString(),
          status: rounds[0].status as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED",
          // Only send string IDs for qualifiedParticipantIds
          qualifiedParticipantIds: athleteIds,
        },
      ];
  
      const response = await fetch(`/api/events/${resolvedParams.eventId}/rounds`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "mfakhrull",
        },
        body: JSON.stringify({
          rounds: formattedRounds,
          updatedAt: "2025-02-24 08:07:36",
          updatedBy: "mfakhrull",
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update rounds");
      }
  
      await fetchEventDetails();
      toast.success("Rounds updated successfully");
    } catch (error) {
      console.error("Error updating rounds:", error);
      toast.error(
        error instanceof Error ? error.message : "Error updating rounds"
      );
    }
  };
  const handleResultsSubmit = async (data: any) => {
    try {
      const response = await fetch(
        `/api/events/${resolvedParams.eventId}/results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": "mfakhrull",
          },
          body: JSON.stringify({
            results: data.results,
            updatedAt: "2025-02-23 18:50:50",
            updatedBy: "mfakhrull",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save results");

      toast.success("Results saved successfully");
      fetchEventDetails();
      setShowResultsDialog(false);
    } catch (error) {
      toast.error("Error saving results");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${resolvedParams.schoolCode}/events`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground">{event.sport.name}</p>
          </div>
        </div>
        <Badge
          variant={
            event.status === "DRAFT"
              ? "secondary"
              : event.status === "PUBLISHED"
              ? "default"
              : event.status === "IN_PROGRESS"
              ? "destructive"
              : "success"
          }
        >
          {event.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent suppressHydrationWarning>
            <p>{formattedDates.eventDate || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Venue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{event.venue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {event.participants.length} / {event.maxParticipants}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="heats">Heats</TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="participants">
          <ParticipantsList
            eventId={event!._id}
            participants={event!.participants}
            onAddParticipants={() => setShowAddDialog(true)}
            onParticipantStatusChange={handleStatusChange}
            onParticipantRemove={handleRemoveParticipant}
          />
        </TabsContent>

        <TabsContent value="heats">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Heats</CardTitle>
                {event!.status !== "COMPLETED" && (
                  <Button
                    onClick={() => {
                      setSelectedHeat(null);
                      setShowHeatDialog(true);
                    }}
                  >
                    Add Heat
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {event!.heats && event!.heats.length > 0 ? (
                <div className="space-y-4">
                  {event!.heats.map((heat) => (
                    <div
                      key={heat.number}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">Heat {heat.number}</h3>
                        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                          {formattedDates[`heat${heat.number}`] || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            heat.status === "COMPLETED"
                              ? "success"
                              : heat.status === "IN_PROGRESS"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {heat.status}
                        </Badge>
                        {event!.status !== "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedHeat(heat.number);
                              setShowHeatDialog(true);
                            }}
                          >
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No heats have been created yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rounds">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rounds</CardTitle>
                {event!.status !== "COMPLETED" && (
                  <Button
                    onClick={() => {
                      setSelectedRound(null);
                      setShowRoundDialog(true);
                    }}
                  >
                    Add Round
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {event!.rounds && event!.rounds.length > 0 ? (
                <div className="space-y-4">
                  {event!.rounds.map((round) => (
                    <div
                      key={round.number}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{round.type}</h3>
                        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                          {formattedDates[`round${round.number}`] || 'N/A'}
                        </p>
                        {round.qualifiedParticipantIds?.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {round.qualifiedParticipantIds.length} participants
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            round.status === "COMPLETED"
                              ? "success"
                              : round.status === "IN_PROGRESS"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {round.status}
                        </Badge>
                        {event!.status !== "COMPLETED" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRound(round.number);
                                setShowRoundDialog(true);
                              }}
                            >
                              Manage
                            </Button>
                            <ManageRoundResultsButton
                              eventId={event._id}
                              round={{
                                ...round,
                                startTime: new Date(round.startTime)
                              }}
                              participants={event.participants}
                              eventType={event.type}
                              onResultsUpdate={fetchEventDetails}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No rounds have been created yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="grid gap-6 grid-cols-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Final Results</CardTitle>
                  {/* {event.status === "IN_PROGRESS" &&
                    event.rounds?.some((r) => r.type === "FINAL") && (
                      <Button onClick={() => setShowResultsDialog(true)}>
                        Record Final Results
                      </Button>
                    )} */}
                </div>
              </CardHeader>
              <CardContent>
                <EventStatistics
                  participants={event.participants}
                  eventType={event.type}
                  finalRound={event.rounds?.find((r) => r.type === "FINAL")}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AddParticipantsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddParticipants}
        eventId={event!._id}
        existingParticipants={event!.participants.map((p) => p.athlete._id)}
        schoolCode={resolvedParams.schoolCode}
      />

      <ManageResultsDialog
        open={showResultsDialog}
        onOpenChange={setShowResultsDialog}
        eventId={event._id}
        eventType={event.type}
        participants={event.participants}
        onSubmit={handleResultsSubmit}
      />

      <ManageHeatDialog
        open={showHeatDialog}
        onOpenChange={setShowHeatDialog}
        eventId={event._id}
        heatNumber={selectedHeat || undefined}
        participants={event.participants}
        onSubmit={async (data) => {
          await handleHeatsUpdate([data]);
          setShowHeatDialog(false);
          setSelectedHeat(null);
        }}
        initialData={
          selectedHeat
            ? event.heats?.find((h) => h.number === selectedHeat)
            : undefined
        }
      />

      <ManageRoundDialog
        open={showRoundDialog}
        onOpenChange={setShowRoundDialog}
        eventId={event._id}
        roundNumber={selectedRound || undefined}
        participants={event.participants}
        onSubmit={async (data) => {
          try {
            // Get existing results from the current round if it exists
            const existingResults = selectedRound
              ? event.rounds?.find((r) => r.number === selectedRound)
                  ?.results || []
              : [];

            // Create a single round object with the form data
            const roundData = [
              {
                ...data,
                results: existingResults,
              },
            ];

            await handleRoundsUpdate(roundData);
            setShowRoundDialog(false);
            setSelectedRound(null);
          } catch (error) {
            console.error("Error saving round:", error);
            toast.error("Failed to save round");
          }
        }}
        initialData={
          selectedRound
            ? event.rounds?.find((r) => r.number === selectedRound)
            : undefined
        }
      />
    </div>
  );
}

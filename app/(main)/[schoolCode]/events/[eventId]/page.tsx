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
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, Medal, Users } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [resolvedParams.eventId]);

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
          <CardContent>
            <p>{format(new Date(event.date), "PPP")}</p>
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

      <ParticipantsList
        eventId={event._id}
        participants={event.participants}
        onAddParticipants={() => setShowAddDialog(true)}
        onParticipantStatusChange={handleStatusChange}
        onParticipantRemove={handleRemoveParticipant}
      />

      <AddParticipantsDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddParticipants}
        eventId={event._id}
        existingParticipants={event.participants.map((p) => p.athlete._id)}
        schoolCode={resolvedParams.schoolCode}
      />
    </div>
  );
}

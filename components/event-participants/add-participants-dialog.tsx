"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

interface AddParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (selectedAthletes: Athlete[]) => Promise<void>;
  eventId: string;
  existingParticipants: string[]; // Array of athlete IDs already in the event
  schoolCode: string; // Add schoolCode prop
}
interface Team {
  _id: string;
  name: string;
  color: string;
}

interface AgeClassFilter {
  _id: string;
  name: string;
  code: string;
}

export function AddParticipantsDialog({
  open,
  onOpenChange,
  onSubmit,
  eventId,
  existingParticipants,
  schoolCode,
}: AddParticipantsDialogProps) {
  const [athletes, setAthletes] = React.useState<Athlete[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [ageClasses, setAgeClasses] = React.useState<AgeClassFilter[]>([]);
  const [selectedAthletes, setSelectedAthletes] = React.useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedTeam, setSelectedTeam] = React.useState<string>("all");
  const [selectedAgeClass, setSelectedAgeClass] = React.useState<string>("all");

  // Fetch teams
  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`/api/teams?schoolCode=${schoolCode}`);
        if (!response.ok) throw new Error("Failed to fetch teams");
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    if (open && schoolCode) {
      fetchTeams();
    }
  }, [open, schoolCode]);

  // Fetch age classes
  React.useEffect(() => {
    const fetchAgeClasses = async () => {
      try {
        const response = await fetch(
          `/api/age-classes?schoolCode=${schoolCode}`
        );
        if (!response.ok) throw new Error("Failed to fetch age classes");
        const data = await response.json();
        setAgeClasses(data);
      } catch (error) {
        console.error("Error fetching age classes:", error);
      }
    };

    if (open && schoolCode) {
      fetchAgeClasses();
    }
  }, [open, schoolCode]);

  // Fetch athletes with filters
  React.useEffect(() => {
    const fetchAthletes = async () => {
      try {
        setIsLoading(true);
        let url = `/api/athletes/active?schoolCode=${schoolCode}`;
        if (selectedTeam && selectedTeam !== "all") url += `&team=${selectedTeam}`;
        if (selectedAgeClass && selectedAgeClass !== "all") url += `&ageClass=${selectedAgeClass}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch athletes");
        const data = await response.json();
        setAthletes(data);
      } catch (error) {
        console.error("Error fetching athletes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open && schoolCode) {
      fetchAthletes();
    }
  }, [open, schoolCode, selectedTeam, selectedAgeClass]);

  const handleSubmit = async () => {
    if (selectedAthletes.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedAthletes);
      setSelectedAthletes([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding participants:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAthlete = (athlete: Athlete) => {
    setSelectedAthletes((current) => {
      const isSelected = current.some((a) => a._id === athlete._id);
      if (isSelected) {
        return current.filter((a) => a._id !== athlete._id);
      }
      return [...current, athlete];
    });
  };

  const filteredAthletes = athletes.filter(
    (athlete) =>
      !existingParticipants.includes(athlete._id) &&
      (search === "" ||
        athlete.fullName.toLowerCase().includes(search.toLowerCase()) ||
        athlete.athleteNumber.toLowerCase().includes(search.toLowerCase()))
  );


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Participants</DialogTitle>
          <DialogDescription>
            Select athletes to add to this event. You can search by name or
            athlete number.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Add filters */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={selectedTeam}
              onValueChange={setSelectedTeam}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team._id} value={team._id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color.toLowerCase() }}
                      />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedAgeClass}
              onValueChange={setSelectedAgeClass}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by age class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Age Classes</SelectItem>
                {ageClasses.map((ageClass) => (
                  <SelectItem key={ageClass._id} value={ageClass._id}>
                    {ageClass.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Command>
            <CommandInput
              placeholder="Search athletes..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <ScrollArea className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredAthletes.length === 0 ? (
                  <CommandEmpty>No athletes found.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {filteredAthletes.map((athlete) => (
                      <CommandItem
                        key={athlete._id}
                        onSelect={() => toggleAthlete(athlete)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{athlete.fullName}</span>
                          <span className="text-sm text-muted-foreground">
                            {athlete.athleteNumber} • {athlete.ageClass.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            style={{
                              backgroundColor: athlete.team.color.toLowerCase(),
                              color: ['white', 'yellow', 'lime'].includes(athlete.team.color.toLowerCase()) ? 'black' : 'white',
                              borderColor: athlete.team.color.toLowerCase()
                            }}
                          >
                            {athlete.team.name}
                          </Badge>
                          <Badge variant="outline">{athlete.gender}</Badge>
                          {selectedAthletes.some(a => a._id === athlete._id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </ScrollArea>
            </CommandList>
          </Command>

          {selectedAthletes.length > 0 && (
            <div className="border rounded-lg p-4">
              {/* ... (previous selected athletes header remains the same) */}
              <ScrollArea className="h-[100px]">
                <div className="space-y-2">
                  {selectedAthletes.map((athlete) => (
                    <div
                      key={athlete._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex flex-col">
                        <span>{athlete.fullName}</span>
                        <span className="text-muted-foreground">
                          {athlete.athleteNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: athlete.team.color.toLowerCase(),
                            color: ["white", "yellow", "lime"].includes(
                              athlete.team.color.toLowerCase()
                            )
                              ? "black"
                              : "white",
                            borderColor: athlete.team.color.toLowerCase(),
                          }}
                        >
                          {athlete.team.name}
                        </Badge>
                        <Badge variant="outline">{athlete.gender}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleAthlete(athlete)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedAthletes([]);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedAthletes.length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>Add {selectedAthletes.length} Participants</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Update the utility function with current timestamp
export function generateParticipantData(
    athlete: Athlete,
    eventId: string,
    nextNumber: number
  ) {
    return {
      athlete: athlete._id,
      ageClass: athlete.ageClass._id,
      number: `${eventId.slice(-4)}-${nextNumber.toString().padStart(3, "0")}`,
      category: athlete.gender,
      status: "REGISTERED" as const,
      createdAt: "2025-02-23 12:50:17",
      createdBy: "mfakhrull",
      updatedAt: "2025-02-23 12:50:17",
      updatedBy: "mfakhrull",
    };
  }

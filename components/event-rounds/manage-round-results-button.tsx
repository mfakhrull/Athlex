"use client";

import { Button } from "@/components/ui/button";
import { Medal } from "lucide-react";
import { useState } from "react";
import { ManageRoundResultsDialog } from "./manage-round-results-dialog";
import { Participant, Round, EventType } from "@/types/event";
import { BaseResult, RoundResult } from "@/types/event";


const addMetadata = (results: BaseResult[]): RoundResult[] => {
    return results.map(result => ({
      ...result,
      createdAt: "2025-02-24 06:12:39",
      createdBy: "mfakhrull",
      updatedAt: "2025-02-24 06:12:39",
      updatedBy: "mfakhrull",
    }));
  };

interface ManageRoundResultsButtonProps {
  eventId: string;
  round: Round;
  participants: Participant[];
  eventType: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  onResultsUpdate: () => Promise<void>;
}

export function ManageRoundResultsButton({
    eventId,
    round,
    participants,
    eventType,
    onResultsUpdate,
  }: ManageRoundResultsButtonProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
  
    // Transform the round results to include metadata
    const roundResultsWithMetadata = round.results ? addMetadata(round.results) : undefined;
  
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2"
          disabled={isUpdating}
        >
          <Medal className="h-4 w-4" />
          Results
        </Button>
  
        <ManageRoundResultsDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          eventId={eventId}
          roundNumber={round.number}
          roundType={round.type}
          qualifiedParticipants={participants.filter(p => 
            round.qualifiedParticipantIds.includes(p._id)
          )}
          eventType={eventType}
          onSubmit={async (data) => {
            setIsUpdating(true);
            try {
              const response = await fetch(
                `/api/events/${eventId}/rounds/${round.number}/results`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    "x-user-email": "mfakhrull",
                  },
                  body: JSON.stringify({
                    results: addMetadata(data.results),
                    updatedAt: "2025-02-24 06:12:39",
                    updatedBy: "mfakhrull",
                  }),
                }
              );
  
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update round results");
              }
  
              await onResultsUpdate();
              setShowDialog(false);
            } catch (error) {
              console.error("Error updating round results:", error);
              throw error;
            } finally {
              setIsUpdating(false);
            }
          }}
          initialResults={roundResultsWithMetadata}
        />
      </>
    );
  }
"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Users, Medal } from "lucide-react";
import { format } from "date-fns";

interface Participant {
  _id: string;
  athlete: {
    _id: string;
    fullName: string;
    athleteNumber: string;
  };
  number: string;
  category: "L" | "P";
  status: string;
  heat?: number;
  result?: {
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  };
}

interface RoundResult {
  participantId: string;
  position?: number;
  time?: string;
  distance?: number;
  height?: number;
  points?: number;
  remarks?: string;
}

interface ManageRoundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  roundNumber?: number;
  participants: Participant[];
  onSubmit: (data: RoundFormValues) => Promise<void>;
  initialData?: {
    number: number;
    type: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
    qualifiedParticipantIds?: string[];
    results?: RoundResult[];
  };
}

const roundSchema = z.object({
  number: z.number().min(1, "Round number must be at least 1"),
  type: z.enum(["QUALIFYING", "QUARTERFINAL", "SEMIFINAL", "FINAL"]),
  startTime: z.string().min(1, "Start time is required"),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"]),
  qualifiedParticipantIds: z.array(z.string()).min(1, "At least one participant must qualify"),
});

type RoundFormValues = z.infer<typeof roundSchema> & {
  results?: RoundResult[];
};
export function ManageRoundDialog({
  open,
  onOpenChange,
  eventId,
  roundNumber,
  participants,
  onSubmit,
  initialData,
}: ManageRoundDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoundFormValues>({
    resolver: zodResolver(roundSchema),
    defaultValues: {
      number: initialData?.number || roundNumber || 1,
      type: initialData?.type || "QUALIFYING",
      startTime: initialData?.startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      status: initialData?.status || "SCHEDULED",
      qualifiedParticipantIds: initialData?.qualifiedParticipantIds || [],
      results: initialData?.results || [],
    },
  });

  const handleSubmit = async (values: RoundFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error managing round:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get eligible participants based on round type
  const getEligibleParticipants = () => {
    return participants.filter(p => p.status === "CONFIRMED");
  };

  // Get participant stats for display
  const getParticipantStats = (participant: Participant) => {
    const roundResult = initialData?.results?.find(r => r.participantId === participant._id);
    return {
      position: roundResult?.position,
      time: roundResult?.time,
      distance: roundResult?.distance,
      height: roundResult?.height,
      points: roundResult?.points,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Round" : `Create Round ${roundNumber || 1}`}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update round details and qualified participants"
              : "Create a new round and select participants to qualify"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Round Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select round type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="QUALIFYING">Qualifying</SelectItem>
                        <SelectItem value="QUARTERFINAL">Quarter Final</SelectItem>
                        <SelectItem value="SEMIFINAL">Semi Final</SelectItem>
                        <SelectItem value="FINAL">Final</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="qualifiedParticipantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Qualified Participants
                  </FormLabel>
                  <div className="border rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
                    {getEligibleParticipants().map((participant) => {
                      const stats = getParticipantStats(participant);
                      return (
                        <div
                          key={participant._id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value.includes(participant._id)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, participant._id]
                                  : field.value.filter(id => id !== participant._id);
                                field.onChange(newValue);
                              }}
                            />
                            <div>
                              <div className="font-medium">
                                {participant.athlete.fullName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {participant.number}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{participant.category}</Badge>
                            {stats.position && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Medal className="h-3 w-3" />
                                {stats.position}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Round'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
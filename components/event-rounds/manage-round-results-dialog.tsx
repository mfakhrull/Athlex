"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { TimeInput } from "@/components/event-results/time-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Info, Loader2 } from "lucide-react";
import { useState } from "react";
import { Participant } from "../event-statistics/event-stats";
import { BaseResult, RoundResult } from "@/types/event";

interface RoundResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  roundNumber: number;
  roundType: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  qualifiedParticipants: Participant[];
  eventType: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  onSubmit: (data: RoundResultsFormValues) => Promise<void>;
  initialResults?: RoundResult[];
}

const timePattern =
  /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)(?:\.(\d{1,3}))?$/;

const roundResultSchema = z.object({
  results: z.array(
    z.object({
      participantId: z.string(),
      position: z.number().min(1).optional(),
      time: z
        .string()
        .regex(timePattern, "Invalid time format (HH:MM:SS.ms)")
        .optional(),
      distance: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
      points: z.number().min(0).optional(),
      remarks: z.string().optional(),
    })
  ),
});

type RoundResultsFormValues = {
  results: BaseResult[];
};

export function ManageRoundResultsDialog({
  open,
  onOpenChange,
  eventId,
  roundNumber,
  roundType,
  qualifiedParticipants,
  eventType,
  onSubmit,
  initialResults,
}: RoundResultsDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoundResultsFormValues>({
    resolver: zodResolver(roundResultSchema),
    defaultValues: {
      results: qualifiedParticipants.map((p) => {
        const existingResult = initialResults?.find(
          (r) => r.participantId === p._id
        );
        return {
          participantId: p._id,
          position: existingResult?.position || undefined,
          time: existingResult?.time || "",
          distance: existingResult?.distance || undefined,
          height: existingResult?.height || undefined,
          points: existingResult?.points || 0,
          remarks: existingResult?.remarks || "",
        };
      }),
    },
  });

  const handleSubmit = async (values: RoundResultsFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving round results:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate points based on position and round type
  const calculatePoints = (position: number): number => {
    if (roundType !== "FINAL") return 0;

    switch (position) {
      case 1:
        return 5;
      case 2:
        return 3;
      case 3:
        return 2;
      case 4:
        return 1;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage {roundType} Results</DialogTitle>
          <DialogDescription>
            Record results for qualified participants in round {roundNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead className="w-[100px]">Position</TableHead>
                    {(eventType === "TRACK" ||
                      eventType === "RELAY" ||
                      eventType === "CROSS_COUNTRY") && (
                      <TableHead className="w-[180px]">Time</TableHead>
                    )}
                    {eventType === "FIELD" && (
                      <TableHead className="w-[120px]">
                        Distance/Height (m)
                      </TableHead>
                    )}
                    <TableHead className="w-[100px]">
                      Points
                      <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <Info className="ml-1 mb-0.5 h-4 w-4 inline" />
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Point can only be calculated in final round</p>
                        </TooltipContent>
                      </Tooltip>
                      </TooltipProvider>
                    </TableHead>

                    <TableHead className="w-[200px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualifiedParticipants.map((participant, index) => (
                    <TableRow key={participant._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {participant.athlete.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {participant.athlete.athleteNumber} •{" "}
                            {participant.category}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`results.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => {
                                    const value = e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined;
                                    field.onChange(value);
                                    if (value) {
                                      const points = calculatePoints(value);
                                      form.setValue(
                                        `results.${index}.points`,
                                        points
                                      );
                                    }
                                  }}
                                  className="w-20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      {(eventType === "TRACK" ||
                        eventType === "RELAY" ||
                        eventType === "CROSS_COUNTRY") && (
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`results.${index}.time`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <TimeInput
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    placeholder="00:00:00.000"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      )}
                      {eventType === "FIELD" && (
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`results.${index}.distance`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    {...field}
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined;
                                      field.onChange(value);
                                    }}
                                    className="w-24"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`results.${index}.points`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                                  className="w-20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`results.${index}.remarks`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="DNF, DQ, etc." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

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
                  "Save Results"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

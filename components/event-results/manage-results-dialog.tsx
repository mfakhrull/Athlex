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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Medal } from "lucide-react";
import { TimeInput } from "./time-input";

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
  lane?: number;
  order?: number;
  heat?: number;
  round?: number;
  result?: {
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  };
}

interface ManageResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventType: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  participants: Participant[];
  onSubmit: (data: ResultsFormValues) => Promise<void>;
}

const timePattern =
  /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)(?:\.(\d{1,3}))?$/;

const resultsSchema = z.object({
  results: z.array(
    z.object({
      participantId: z.string(),
      position: z.number().min(1).optional(),
      time: z
        .union([
          z.string().regex(timePattern, "Invalid time format (HH:MM:SS.ms)"),
          z.literal(""),
        ])
        .optional(),
      distance: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
      points: z.number().min(0).optional(),
      remarks: z.string().optional(),
    })
  ),
});

type ResultsFormValues = z.infer<typeof resultsSchema>;

export function ManageResultsDialog({
  open,
  onOpenChange,
  eventId,
  eventType,
  participants,
  onSubmit,
}: ManageResultsDialogProps) {
  const [activeTab, setActiveTab] = useState<"TRACK" | "FIELD">(
    eventType === "FIELD" ? "FIELD" : "TRACK"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResultsFormValues>({
    resolver: zodResolver(resultsSchema),
    defaultValues: {
      results: participants.map((p) => ({
        participantId: p._id,
        position: p.result?.position || undefined,
        time: p.result?.time || "",
        distance: p.result?.distance || undefined,
        height: p.result?.height || undefined,
        points: p.result?.points || 0,
        remarks: p.result?.remarks || "",
      })),
    },
  });

  const handleSubmit = async (values: ResultsFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving results:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate points based on position
  const calculatePoints = (position: number): number => {
    switch (position) {
      case 1:
        return 5; // Gold
      case 2:
        return 3; // Silver
      case 3:
        return 2; // Bronze
      case 4:
        return 1; // 4th place
      default:
        return 0;
    }
  };

  // Auto-calculate points when position changes
  const handlePositionChange = (index: number, position: number) => {
    const points = calculatePoints(position);
    const results = form.getValues("results");
    results[index].points = points;
    form.setValue("results", results);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Results</DialogTitle>
          <DialogDescription>
            Record results and positions for participants
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "TRACK" | "FIELD")}
        >
          <TabsList>
            {eventType !== "FIELD" && (
              <TabsTrigger value="TRACK">Track Events</TabsTrigger>
            )}
            {eventType === "FIELD" && (
              <TabsTrigger value="FIELD">Field Events</TabsTrigger>
            )}
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <ScrollArea className="h-[400px] overflow-y-auto">
                <div className="space-y-4 p-4">
                  {participants.map((participant, index) => (
                    <div
                      key={participant._id}
                      className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 items-center border-b pb-4"
                    >
                      <div>
                        <p className="font-medium">
                          {participant.athlete.fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {participant.number} • {participant.category}
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name={`results.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
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
                                    handlePositionChange(index, value);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {activeTab === "TRACK" ? (
                        <FormField
                          control={form.control}
                          name={`results.${index}.time`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time</FormLabel>
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
                      ) : (
                        <div className="space-y-2">
                          <Select
                            onValueChange={(value) => {
                              // Clear both fields when switching
                              form.setValue(`results.${index}.distance`, undefined);
                              form.setValue(`results.${index}.height`, undefined);
                            }}
                            defaultValue="distance"
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="distance">Distance</SelectItem>
                              <SelectItem value="height">Height</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {form.watch(`results.${index}.height`) !== undefined ? (
                            <FormField
                              control={form.control}
                              name={`results.${index}.height`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Height (m)</FormLabel>
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
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          ) : (
                            <FormField
                              control={form.control}
                              name={`results.${index}.distance`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Distance (m)</FormLabel>
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
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name={`results.${index}.points`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Points</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

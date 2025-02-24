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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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
}

interface ManageHeatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  heatNumber?: number;
  participants: Participant[];
  onSubmit: (data: HeatFormValues) => Promise<void>;
  initialData?: {
    number: number;
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
    participantIds?: string[];
  };
}

const heatSchema = z.object({
  number: z.number().min(1, "Heat number must be at least 1"),
  startTime: z.string().min(1, "Start time is required"),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"]),
  participantIds: z.array(z.string()).min(1, "At least one participant is required"),
});

type HeatFormValues = z.infer<typeof heatSchema>;

export function ManageHeatDialog({
  open,
  onOpenChange,
  eventId,
  heatNumber,
  participants,
  onSubmit,
  initialData,
}: ManageHeatDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<HeatFormValues>({
    resolver: zodResolver(heatSchema),
    defaultValues: {
      number: initialData?.number || heatNumber || 1,
      startTime: initialData?.startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      status: initialData?.status || "SCHEDULED",
      participantIds: initialData?.participantIds || [],
    },
  });

  const handleSubmit = async (values: HeatFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error managing heat:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Heat" : "Add Heat"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update heat details and assign participants"
              : "Create a new heat and assign participants"}
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
                    <FormLabel>Heat Number</FormLabel>
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
            </div>

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

            <FormField
              control={form.control}
              name="participantIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Participants</FormLabel>
                  <div className="border rounded-lg p-4 space-y-2">
                    {participants
                      .filter(p => p.status === "CONFIRMED")
                      .map((participant) => (
                        <div
                          key={participant._id}
                          className="flex items-center space-x-2"
                        >
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
                          <span>
                            {participant.athlete.fullName} ({participant.number})
                          </span>
                          <Badge variant="outline">
                            {participant.category}
                          </Badge>
                        </div>
                      ))}
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
                  'Save Heat'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
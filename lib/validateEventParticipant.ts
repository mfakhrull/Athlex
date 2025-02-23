import { z } from "zod";

export const eventParticipantSchema = z.object({
  athlete: z.string(),
  ageClass: z.string(),
  number: z.string(),
  category: z.enum(["L", "P"]),
  lane: z.number().optional(),
  order: z.number().optional(),
  heat: z.number().optional(),
  round: z.number().optional(),
  status: z.enum([
    "REGISTERED",
    "CONFIRMED",
    "SCRATCHED",
    "DNS",
    "DNF",
    "DQ"
  ]).default("REGISTERED"),
  result: z.object({
    position: z.number().optional(),
    time: z.string().optional(),
    distance: z.number().optional(),
    height: z.number().optional(),
    points: z.number().optional(),
    remarks: z.string().optional(),
  }).optional(),
});

export type EventParticipant = z.infer<typeof eventParticipantSchema>;

export function validateEventParticipant(data: unknown) {
  try {
    return {
      success: true,
      data: eventParticipantSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid participant data"
    };
  }
}
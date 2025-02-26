"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSeason } from "@/contexts/SeasonContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const heatSchema = z.object({
  number: z.number().min(1, "Heat number is required"),
  startTime: z.date({
    required_error: "Heat start time is required",
  }),
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"])
    .default("SCHEDULED"),
});

const roundSchema = z.object({
  number: z.number().min(1, "Round number is required"),
  type: z.enum(["QUALIFYING", "QUARTERFINAL", "SEMIFINAL", "FINAL"]),
  startTime: z.date({
    required_error: "Round start time is required",
  }),
  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"])
    .default("SCHEDULED"),
});

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  sport: z.string({
    required_error: "Sport is required",
  }),
  season: z.string({
    required_error: "Season is required",
  }),
  ageClasses: z.array(z.string()).min(1, "At least one age class is required"),
  categories: z
    .array(z.enum(["L", "P"]))
    .min(1, "At least one category is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  venue: z.string().min(1, "Venue is required"),
  type: z.enum(["TRACK", "FIELD", "RELAY", "CROSS_COUNTRY"], {
    required_error: "Event type is required",
  }),
  maxParticipants: z
    .number()
    .min(1, "Must allow at least 1 participant")
    .max(1000, "Maximum 1000 participants allowed"),
  heats: z.array(heatSchema).optional(),
  rounds: z.array(roundSchema).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Sport {
  _id: string;
  name: string;
  code: string;
}

interface AgeClass {
  _id: string;
  name: string;
  code: string;
}

interface CreateEventPageProps {
  params: Promise<{
    schoolCode: string;
  }>;
}

export default function CreateEventPage({ params }: CreateEventPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentSeason } = useSeason();
  const [sports, setSports] = useState<Sport[]>([]);
  const [ageClasses, setAgeClasses] = useState<AgeClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      sport: "",
      season: currentSeason?._id || "",
      ageClasses: [],
      categories: [],
      date: new Date(), // Use current date
      venue: "",
      type: "TRACK",
      maxParticipants: 50,
      heats: [],
      rounds: [],
    },
  });

  useEffect(() => {
    fetchSports();
    fetchAgeClasses();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await fetch(
        `/api/sports?schoolCode=${resolvedParams.schoolCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setSports(data);
      }
    } catch (error) {
      toast.error("Error loading sports");
    }
  };

  const fetchAgeClasses = async () => {
    try {
      const response = await fetch(
        `/api/age-classes?schoolCode=${resolvedParams.schoolCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setAgeClasses(data);
      }
    } catch (error) {
      toast.error("Error loading age classes");
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/events/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          schoolCode: resolvedParams.schoolCode,
          season: currentSeason?._id,
          status: "DRAFT",
          participants: [],
          heats: values.heats || [],
          rounds: values.rounds || [],
          createdAt: "2025-02-23T11:45:40Z", // Current timestamp
          createdBy: "mfakhrull", // Current user
          updatedAt: "2025-02-23T11:45:40Z", // Current timestamp
          updatedBy: "mfakhrull", // Current user
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create event");
      }

      const data = await response.json();
      toast.success("Event created successfully");
      router.push(`/${resolvedParams.schoolCode}/events/${data._id}`);
    } catch (error: any) {
      toast.error(error.message || "Error creating event");
    } finally {
      setIsLoading(false);
    }
  };

  const addHeat = () => {
    const currentHeats = form.getValues("heats") || [];
    form.setValue("heats", [
      ...currentHeats,
      {
        number: currentHeats.length + 1,
        startTime: new Date("2025-02-23T11:45:40Z"),
        status: "SCHEDULED",
      },
    ]);
  };

  // Helper function to add a round
  const addRound = () => {
    const currentRounds = form.getValues("rounds") || [];
    form.setValue("rounds", [
      ...currentRounds,
      {
        number: currentRounds.length + 1,
        type: "QUALIFYING",
        startTime: new Date("2025-02-23T11:45:40Z"),
        status: "SCHEDULED",
      },
    ]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${resolvedParams.schoolCode}/events`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Event</h1>
            <p className="text-muted-foreground">
              Add a new sports event or competition
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter event name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport._id} value={sport._id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TRACK">Track</SelectItem>
                        <SelectItem value="FIELD">Field</SelectItem>
                        <SelectItem value="RELAY">Relay</SelectItem>
                        <SelectItem value="CROSS_COUNTRY">
                          Cross Country
                        </SelectItem>
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter venue" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ageClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Classes</FormLabel>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value.length > 0 ? (
                          field.value.map((selectedId) => {
                            const selectedClass = ageClasses.find(
                              (ac) => ac._id === selectedId
                            );
                            return selectedClass ? (
                              <Badge
                                key={selectedId}
                                variant="secondary"
                                className="px-2 py-1"
                              >
                                {selectedClass.name}
                                <X
                                  className="ml-1 h-3 w-3 cursor-pointer"
                                  onClick={() => {
                                    field.onChange(
                                      field.value.filter(
                                        (id) => id !== selectedId
                                      )
                                    );
                                  }}
                                />
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            No age classes selected
                          </div>
                        )}
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            type="button"
                            className="w-full justify-between"
                          >
                            Select age classes
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search age classes..." />
                            <CommandList>
                              <CommandEmpty>No age classes found.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-64">
                                  {ageClasses.map((ageClass) => (
                                    <CommandItem
                                      key={ageClass._id}
                                      value={ageClass._id}
                                      onSelect={() => {
                                        const isSelected = field.value.includes(
                                          ageClass._id
                                        );
                                        const newValue = isSelected
                                          ? field.value.filter(
                                              (id) => id !== ageClass._id
                                            )
                                          : [...field.value, ageClass._id];
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value.includes(ageClass._id)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {ageClass.name}
                                    </CommandItem>
                                  ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.value.includes("L")}
                          onChange={(e) => {
                            const values = new Set(field.value);
                            if (e.target.checked) {
                              values.add("L");
                            } else {
                              values.delete("L");
                            }
                            field.onChange(Array.from(values));
                          }}
                        />
                        Male (L)
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={field.value.includes("P")}
                          onChange={(e) => {
                            const values = new Set(field.value);
                            if (e.target.checked) {
                              values.add("P");
                            } else {
                              values.delete("P");
                            }
                            field.onChange(Array.from(values));
                          }}
                        />
                        Female (P)
                      </label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of participants allowed in this event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? "Hide" : "Show"} Advanced Settings
              </Button>
            </div>

            {showAdvancedSettings && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Heats</h3>
                    <Button
                      type="button"
                      onClick={addHeat}
                      variant="outline"
                      size="sm"
                    >
                      Add Heat
                    </Button>
                  </div>

                  {form.watch("heats")?.map((heat, index) => (
                    <div
                      key={index}
                      className="space-y-4 p-4 border rounded-lg"
                    >
                      <FormField
                        control={form.control}
                        name={`heats.${index}.number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Heat Number</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`heats.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <input
                                type="datetime-local"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .slice(0, 16)
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`heats.${index}.status`}
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
                                <SelectItem value="SCHEDULED">
                                  Scheduled
                                </SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const heats = form.getValues("heats");
                          form.setValue(
                            "heats",
                            heats?.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Remove Heat
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Rounds</h3>
                    <Button
                      type="button"
                      onClick={addRound}
                      variant="outline"
                      size="sm"
                    >
                      Add Round
                    </Button>
                  </div>

                  {form.watch("rounds")?.map((round, index) => (
                    <div
                      key={index}
                      className="space-y-4 p-4 border rounded-lg"
                    >
                      <FormField
                        control={form.control}
                        name={`rounds.${index}.number`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Round Number</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rounds.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Round Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="QUALIFYING">
                                  Qualifying
                                </SelectItem>
                                <SelectItem value="QUARTERFINAL">
                                  Quarter Final
                                </SelectItem>
                                <SelectItem value="SEMIFINAL">
                                  Semi Final
                                </SelectItem>
                                <SelectItem value="FINAL">Final</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rounds.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <input
                                type="datetime-local"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={
                                  field.value
                                    ? new Date(field.value)
                                        .toISOString()
                                        .slice(0, 16)
                                    : ""
                                }
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rounds.${index}.status`}
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
                                <SelectItem value="SCHEDULED">
                                  Scheduled
                                </SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                  Completed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const rounds = form.getValues("rounds");
                          form.setValue(
                            "rounds",
                            rounds?.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        Remove Round
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/${resolvedParams.schoolCode}/events`)
                }
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

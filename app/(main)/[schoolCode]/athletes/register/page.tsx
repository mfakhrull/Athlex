"use client";

import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  CalendarIcon,
  X,
  PlusCircle,
} from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";
import { Switch } from "@/components/ui/switch";

// Type definitions
interface Team {
  _id: string;
  name: string;
  color: string;
}

interface Sport {
  _id: string;
  name: string;
  type: "individual" | "team";
  isActive: boolean;
}

interface AgeClass {
  _id: string;
  name: string;
  gender: "L" | "P";
  minAge: number;
  maxAge: number;
}

const formSchema = z.object({
  athleteNumber: z.string().min(1, "Athlete number is required"),
  fullName: z.string().min(1, "Full name is required"),
  icNumber: z
    .string()
    .min(12, "IC number must be 12 digits")
    .max(12, "IC number must be 12 digits")
    .regex(/^\d+$/, "IC number must only contain numbers"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(["L", "P"], {
    required_error: "Gender must be either 'L' (Male) or 'P' (Female)",
  }),
  team: z.string().min(1, "Team is required"),
  image: z.string().optional(),
  ageClass: z.string().min(1, "Age class is required"),
  sports: z
    .array(
      z.object({
        sport: z.string().min(1, "Sport is required"),
        isActive: z.boolean().default(true),
      })
    )
    .min(1, "At least one sport must be selected"),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  guardianEmail: z.string().optional(),
  address: z.string().optional(),
  medicalConditions: z.array(z.string()).default([]),
  emergencyContact: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function AthleteRegistrationPage({
  params,
}: {
  params: Promise<{ schoolCode: string }>;
}) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [ageClasses, setAgeClasses] = useState<AgeClass[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      athleteNumber: "",
      fullName: "",
      icNumber: "",
      dateOfBirth: new Date(),
      gender: "L",
      team: "",
      image: "",
      ageClass: "",
      sports: [],
      guardianName: "",
      guardianContact: "",
      guardianEmail: "",
      address: "",
      medicalConditions: [],
      emergencyContact: "",
      isActive: true,
    },
  });

  // Fetch sports, teams, and age classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sports
        const sportsResponse = await fetch(
          `/api/sports?schoolCode=${resolvedParams.schoolCode}`
        );
        if (sportsResponse.ok) {
          const sportsData = await sportsResponse.json();
          setSports(sportsData);
        }

        // Fetch teams
        const teamsResponse = await fetch(
          `/api/teams?schoolCode=${resolvedParams.schoolCode}`
        );
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }

        // Fetch age classes
        const ageClassesResponse = await fetch(
          `/api/age-classes?schoolCode=${resolvedParams.schoolCode}`
        );
        if (ageClassesResponse.ok) {
          const ageClassesData = await ageClassesResponse.json();
          setAgeClasses(ageClassesData);
        }
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };

    fetchData();
  }, [resolvedParams.schoolCode]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const dataToSubmit = {
        ...values,
        schoolCode: resolvedParams.schoolCode,
      };

      // Set default values for hidden fields in simple mode
      if (!isDetailedMode) {
        dataToSubmit.guardianName = "";
        dataToSubmit.guardianContact = "";
        dataToSubmit.guardianEmail = "";
        dataToSubmit.address = "";
        dataToSubmit.medicalConditions = [];
        dataToSubmit.emergencyContact = "";
        dataToSubmit.image = "";
      }

      const response = await fetch("/api/athletes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (response.ok) {
        toast.success("Athlete registered successfully");
        form.reset();
      } else {
        const data = await response.json();
        toast.error("Failed to register athlete", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error registering athlete");
    } finally {
      setIsLoading(false);
    }
  };

  // Watch gender field for avatar and age class filtering
  const gender = form.watch("gender");

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Register New Athlete</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Simple</span>
            <Switch
              checked={isDetailedMode}
              onCheckedChange={setIsDetailedMode}
            />
            <span className="text-sm text-muted-foreground">Detailed</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Required Fields (Always Visible) */}
            <div className="space-y-6">
              {/* Athlete Number */}
              <FormField
                control={form.control}
                name="athleteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Athlete Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter athlete number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* IC Number */}
              <FormField
                control={form.control}
                name="icNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IC Number*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter IC number"
                        {...field}
                        maxLength={12}
                      />
                    </FormControl>
                    <FormDescription>
                      12 digits without dashes (-)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date of Birth */}
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Athlete's date of birth</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gender */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={(value: "L" | "P") => {
                        field.onChange(value);
                        // Reset age class when gender changes
                        form.setValue("ageClass", "");
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="L">Male (L)</SelectItem>
                        <SelectItem value="P">Female (P)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Team (Rumah Sukan) */}
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team (Rumah Sukan)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team._id} value={team._id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: team.color }}
                              />
                              {team.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Age Class */}
              <FormField
                control={form.control}
                name="ageClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Class</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ageClasses
                          .filter((ac) => ac.gender === form.getValues("gender"))
                          .map((ageClass) => (
                            <SelectItem key={ageClass._id} value={ageClass._id}>
                              {ageClass.name} ({ageClass.minAge}-{ageClass.maxAge}{" "}
                              years)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sports */}
              <FormField
                control={form.control}
                name="sports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sports</FormLabel>
                    <div className="space-y-2">
                      {/* Selected sports display */}
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((sportEntry, index) => {
                          const sport = sports.find(
                            (s) => s._id === sportEntry.sport
                          );
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {sport?.name}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const newValue = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  field.onChange(newValue);
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>

                      {/* Sport selector */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              type="button"
                              className={cn(
                                "w-full justify-between",
                                !field.value?.length && "text-muted-foreground"
                              )}
                            >
                              Select sports
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search sports..." />
                            <CommandList>
                              <CommandEmpty>No sports found.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-64">
                                  {sports
                                    .filter((sport) => sport.isActive)
                                    .map((sport) => {
                                      const isSelected = field.value.some(
                                        (s) => s.sport === sport._id
                                      );

                                      return (
                                        <CommandItem
                                          key={sport._id}
                                          value={sport._id}
                                          onSelect={() => {
                                            if (isSelected) {
                                              // Remove sport if already selected
                                              field.onChange(
                                                field.value.filter(
                                                  (s) => s.sport !== sport._id
                                                )
                                              );
                                            } else {
                                              // Add new sport
                                              field.onChange([
                                                ...field.value,
                                                {
                                                  sport: sport._id,
                                                  isActive: true,
                                                },
                                              ]);
                                            }
                                          }}
                                        >
                                          <div className="flex items-center gap-2 w-full">
                                            <Check
                                              className={cn(
                                                "h-4 w-4",
                                                isSelected
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            <div className="flex-1">
                                              {sport.name}
                                              <span className="ml-2 text-muted-foreground">
                                                ({sport.type})
                                              </span>
                                            </div>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormDescription>
                      Select one or more sports for the athlete
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Fields (Only visible in detailed mode) */}
            {isDetailedMode && (
              <>
                {/* Profile Picture Section */}
                <div className="flex justify-center mb-6">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={form.getValues("image")} />
                    <AvatarFallback>
                      {gender === "L" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-12 h-12"
                        >
                          <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 8a6 6 0 1 1 12 0A6 6 0 0 1 6 8zm2 10a3 3 0 0 0-3 3 1 1 0 1 1-2 0 5 5 0 0 1 5-5h8a5 5 0 0 1 5 5 1 1 0 1 1-2 0 3 3 0 0 0-3-3H8z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-12 h-12"
                        >
                          <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 8a6 6 0 1 1 12 0A6 6 0 0 1 6 8zm2 10a3 3 0 0 0-3 3 1 1 0 1 1-2 0 5 5 0 0 1 5-5h8a5 5 0 0 1 5 5 1 1 0 1 1-2 0 3 3 0 0 0-3-3H8z" />
                        </svg>
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Picture URL */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter image URL (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to use default avatar based on gender
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Guardian Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Guardian Information</h3>

                  <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guardian name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter guardian contact number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="guardianEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guardian Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter guardian email"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Used for important notifications and updates
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter full address"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter emergency contact number"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Contact number in case of emergency
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <TagInput
                            placeholder="Type and press enter to add medical conditions"
                            tags={field.value}
                            onChange={(tags) => field.onChange(tags)}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter any medical conditions, allergies, or health
                          concerns
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Disable to temporarily deactivate this athlete
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to reset the form?")
                  ) {
                    form.reset();
                  }
                }}
              >
                Reset Form
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Registering...
                  </div>
                ) : (
                  "Register Athlete"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

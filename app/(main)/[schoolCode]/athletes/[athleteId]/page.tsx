"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Loader2,
  SaveIcon,
  ArrowLeft,
  Trophy,
} from "lucide-react";

const athleteFormSchema = z.object({
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
  gender: z.enum(["L", "P"]),
  team: z.string().min(1, "Team is required"),
  image: z.string().optional(),
  ageClass: z.string().min(1, "Age class is required"),
  sports: z.array(
    z.object({
      sport: z.string(),
      isActive: z.boolean(),
    })
  ),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  medicalConditions: z.array(z.string()).default([]),
  emergencyContact: z.string().optional(),
  isActive: z.boolean(),
});

type AthleteFormValues = z.infer<typeof athleteFormSchema>;

interface Team {
  _id: string;
  name: string;
  color: string;
}

interface Sport {
  _id: string;
  name: string;
  type: "individual" | "team";
}

interface AgeClass {
  _id: string;
  name: string;
  gender: "L" | "P";
  minAge: number;
  maxAge: number;
}

export default function ManageAthletePage({
  params,
}: {
  params: Promise<{ schoolCode: string; athleteId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [ageClasses, setAgeClasses] = useState<AgeClass[]>([]);

  const form = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteFormSchema),
  });

  // Fetch athlete data and populate form
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch athlete details
        const athleteResponse = await fetch(
          `/api/athletes/${resolvedParams.athleteId}`
        );
        if (!athleteResponse.ok) throw new Error("Failed to fetch athlete");
        const athleteData = await athleteResponse.json();

        // Fetch teams
        const teamsResponse = await fetch(
          `/api/teams?schoolCode=${resolvedParams.schoolCode}`
        );
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        }

        // Fetch sports
        const sportsResponse = await fetch(
          `/api/sports?schoolCode=${resolvedParams.schoolCode}`
        );
        if (sportsResponse.ok) {
          const sportsData = await sportsResponse.json();
          setSports(sportsData);
        }

        // Fetch age classes
        const ageClassesResponse = await fetch(
          `/api/age-classes?schoolCode=${resolvedParams.schoolCode}`
        );
        if (ageClassesResponse.ok) {
          const ageClassesData = await ageClassesResponse.json();
          setAgeClasses(ageClassesData);
        }

        // Transform sports data to match form structure
        const transformedSports = athleteData.sports.map((sport: any) => ({
          sport: sport.sport._id,
          isActive: sport.isActive,
        }));

        // Set form values with complete athlete data
        form.reset({
          athleteNumber: athleteData.athleteNumber,
          fullName: athleteData.fullName,
          icNumber: athleteData.icNumber,
          dateOfBirth: new Date(athleteData.dateOfBirth),
          gender: athleteData.gender,
          team: athleteData.team?._id || "",
          image: athleteData.image || "",
          ageClass: athleteData.ageClass?._id || "",
          sports: transformedSports,
          guardianName: athleteData.guardianName || "",
          guardianContact: athleteData.guardianContact || "",
          guardianEmail: athleteData.guardianEmail || "",
          address: athleteData.address || "",
          medicalConditions: athleteData.medicalConditions || [],
          emergencyContact: athleteData.emergencyContact || "",
          isActive: athleteData.isActive ?? true,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load athlete data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.athleteId, resolvedParams.schoolCode, form]);

  const onSubmit = async (values: AthleteFormValues) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/athletes/${resolvedParams.athleteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Athlete updated successfully");
      } else {
        const data = await response.json();
        toast.error("Failed to update athlete", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error updating athlete");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${resolvedParams.schoolCode}/athletes/list`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <h1 className="text-2xl font-bold">Manage Athlete</h1>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            router.push(
              `/${resolvedParams.schoolCode}/athletes/${resolvedParams.athleteId}/achievements`
            )
          }
        >
          <Trophy className="h-4 w-4 mr-2" />
          Achievements
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="athleteNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Athlete Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IC Number</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={12} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team (Rumah Sukan)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
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
                                className="w-3 h-3 rounded-full"
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
            </div>

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a URL for the athlete's profile picture
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Sports and Age Class */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Sports Information</h2>
            
            <FormField
              control={form.control}
              name="ageClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ageClasses
                        .filter(
                          (ac) => ac.gender === form.getValues("gender")
                        )
                        .map((ageClass) => (
                          <SelectItem key={ageClass._id} value={ageClass._id}>
                            {ageClass.name} ({ageClass.minAge}-{ageClass.maxAge} years)
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
              name="sports"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sports</FormLabel>
                  <div className="space-y-4">
                    {sports.map((sport) => {
                      const athleteSport = field.value.find(
                        (s) => s.sport === sport._id
                      );
                      return (
                        <div
                          key={sport._id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={athleteSport?.isActive ?? false}
                              onCheckedChange={(checked) => {
                                const newSports = [...field.value];
                                const sportIndex = newSports.findIndex(
                                  (s) => s.sport === sport._id
                                );
                                if (sportIndex > -1) {
                                  newSports[sportIndex].isActive = checked;
                                } else {
                                  newSports.push({
                                    sport: sport._id,
                                    isActive: checked,
                                  });
                                }
                                field.onChange(newSports);
                              }}
                            />
                            <span>{sport.name}</span>
                          </div>
                          <Badge variant={athleteSport?.isActive ? "default" : "secondary"}>
                            {athleteSport?.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        );
                    })}
                  </div>
                  <FormDescription>
                    Toggle sports participation status
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Guardian Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Guardian Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Additional Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Additional Information</h2>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[100px]"
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
                    <Input {...field} />
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
                    Enter any medical conditions, allergies, or health concerns
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Status */}
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

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${resolvedParams.schoolCode}/athletes/list`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Last Updated Info */}
      {/* <div className="mt-8 text-sm text-muted-foreground text-center">
        Last updated by {form.getValues("updatedBy") || "Unknown"} at{" "}
        {format(new Date(form.getValues("updatedAt")), "PPpp")}
      </div> */}
    </div>
  );
}
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Loader2,
  PlusCircle,
  ArrowLeft,
  Pencil,
  Trash2,
  Trophy,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSeason } from "@/contexts/SeasonContext";

interface Achievement {
  _id: string;
  title: string;
  date: string;
  description?: string;
  season?: string; // Make season optional
  sport: string;
  tournament: {
    name: string;
    venue?: string;
    ageClass: string;
    level?: "SEKOLAH" | "MSSD" | "MSSN" | "MSSM" | "SUKMA";
  };
  result: {
    position: number;
    medal?: "GOLD" | "SILVER" | "BRONZE";
    points?: number;
    remarks?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface Athlete {
  _id: string;
  fullName: string;
  athleteNumber: string;
  ageClass: string;
  sports: {
    sport: string;
    joinedAt: Date;
    isActive: boolean;
  }[];
  achievements: Achievement[];
}

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

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  description: z.string().optional(),
  season: z.string().nullable(), // Change to nullable instead of optional
  sport: z.string({
    required_error: "Sport is required",
  }),
  tournament: z.object({
    name: z.string().min(1, "Tournament name is required"),
    venue: z.string().optional(),
    ageClass: z.string({
      required_error: "Age class is required",
    }),
    level: z.enum(["SEKOLAH", "MSSD", "MSSN", "MSSM", "SUKMA"], {
      required_error: "Level is required",
    }),
  }),
  result: z.object({
    position: z.number().min(1, "Position must be at least 1"),
    medal: z.enum(["GOLD", "SILVER", "BRONZE"]).optional(),
    points: z.number().optional(),
    remarks: z.string().optional(),
  }),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

export default function AchievementsPage({
  params,
}: {
  params: Promise<{ schoolCode: string; athleteId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { currentSeason } = useSeason();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [ageClasses, setAgeClasses] = useState<AgeClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [achievementToDelete, setAchievementToDelete] =
    useState<Achievement | null>(null);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      season: currentSeason?._id || null, // Set to null instead of empty string
      sport: "",
      tournament: {
        name: "",
        venue: "",
        ageClass: "",
        level: "SEKOLAH",
      },
      result: {
        position: 1,
        points: 0,
        remarks: "",
      },
    },
  });

  useEffect(() => {
    fetchAthleteData();
    fetchSports();
    fetchAgeClasses();
  }, [resolvedParams.athleteId]);

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
      console.error("Error loading sports:", error);
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
      console.error("Error loading age classes:", error);
    }
  };

  useEffect(() => {
    fetchAthleteData();
  }, [resolvedParams.athleteId]);

  const fetchAthleteData = async () => {
    try {
      const response = await fetch(`/api/athletes/${resolvedParams.athleteId}`);
      if (response.ok) {
        const data = await response.json();
        setAthlete(data);
      } else {
        toast.error("Failed to fetch athlete data");
      }
    } catch (error) {
      toast.error("Error loading athlete data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    form.reset({
      title: achievement.title,
      date: new Date(achievement.date),
      description: achievement.description,
      season: achievement.season,
      sport: achievement.sport,
      tournament: {
        name: achievement.tournament.name,
        venue: achievement.tournament.venue,
        ageClass: achievement.tournament.ageClass,
        level: achievement.tournament.level || "SEKOLAH",
      },
      result: {
        position: achievement.result.position,
        medal: achievement.result.medal,
        points: achievement.result.points,
        remarks: achievement.result.remarks,
      },
    });
    setShowDialog(true);
  };

  const handleDeleteAchievement = (achievement: Achievement) => {
    setAchievementToDelete(achievement);
  };

  const confirmDelete = async () => {
    if (!achievementToDelete) return;
    setIsDeleting(true);
  
    try {
      const response = await fetch(
        `/api/athletes/${resolvedParams.athleteId}/achievements/${achievementToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-email": "mfakhrull",
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete achievement");
      }
  
      toast.success(data.message || "Achievement deleted successfully");
      await fetchAthleteData();
      setAchievementToDelete(null);
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error(error instanceof Error ? error.message : "Error deleting achievement");
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (values: AchievementFormValues) => {
    setIsSubmitting(true);
    try {
      const method = editingAchievement ? "PUT" : "POST";
      const url = editingAchievement
        ? `/api/athletes/${resolvedParams.athleteId}/achievements/${editingAchievement._id}`
        : `/api/athletes/${resolvedParams.athleteId}/achievements`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "mfakhrull",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(
          `Achievement ${editingAchievement ? "updated" : "added"} successfully`
        );
        fetchAthleteData();
        setShowDialog(false);
        form.reset();
        setEditingAchievement(null);
      } else {
        toast.error("Failed to save achievement");
      }
    } catch (error) {
      toast.error("Error saving achievement");
    } finally {
      setIsSubmitting(false);
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
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() =>
                router.push(
                  `/${resolvedParams.schoolCode}/athletes/${resolvedParams.athleteId}`
                )
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Athlete
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Achievements</h1>
              <p className="text-muted-foreground">
                {athlete?.fullName} ({athlete?.athleteNumber})
              </p>
            </div>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAchievement ? "Edit" : "Add"} Achievement
                </DialogTitle>
                <DialogDescription>
                  Enter the details of the achievement below.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Achievement title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
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
                      name="sport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sport</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
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
                      name="tournament.level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SEKOLAH">SEKOLAH</SelectItem>
                              <SelectItem value="MSSD">MSSD</SelectItem>
                              <SelectItem value="MSSK">MSSK</SelectItem>
                              <SelectItem value="SUKMA">SUKMA</SelectItem>
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
                      name="tournament.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tournament Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tournament name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tournament.venue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Venue</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Tournament venue" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tournament.ageClass"
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
                              {ageClasses.map((ageClass) => (
                                <SelectItem
                                  key={ageClass._id}
                                  value={ageClass._id}
                                >
                                  {ageClass.name}
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
                      name="result.position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="result.medal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medal</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select medal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="GOLD">Gold</SelectItem>
                              <SelectItem value="SILVER">Silver</SelectItem>
                              <SelectItem value="BRONZE">Bronze</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="result.points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Achievement description"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="result.remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Additional remarks"
                            className="min-h-[60px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="season"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Season (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined} // Handle null value
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select season (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No Season</SelectItem>
                              {currentSeason && (
                                <SelectItem value={currentSeason.name}>
                                  {currentSeason.name} (Current)
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Link this achievement to track season medals and
                            points
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDialog(false);
                        form.reset();
                        setEditingAchievement(null);
                      }}
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
                        <>Save</>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Achievements List */}
        <div className="grid gap-4">
          {athlete?.achievements?.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No achievements yet</p>
              <p className="text-muted-foreground">
                Add an achievement to get started
              </p>
            </div>
          ) : (
            athlete?.achievements
              ?.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((achievement) => (
                <Card key={achievement._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {achievement.title}
                          {achievement.season &&
                            achievement.season !== "none" && (
                              <Badge variant="secondary" className="ml-2">
                                {achievement.season}
                              </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div>{format(new Date(achievement.date), "PPP")}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">
                              {achievement.tournament.level}
                            </Badge>
                            {achievement.result.medal && (
                              <Badge
                                variant="outline"
                                className={cn("font-semibold", {
                                  "text-yellow-600":
                                    achievement.result.medal === "GOLD",
                                  "text-gray-400":
                                    achievement.result.medal === "SILVER",
                                  "text-amber-700":
                                    achievement.result.medal === "BRONZE",
                                })}
                              >
                                {achievement.result.medal}
                              </Badge>
                            )}
                            {achievement.result.points &&
                              achievement.result.points > 0 && (
                                <Badge variant="secondary">
                                  Points: {achievement.result.points}
                                </Badge>
                              )}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAchievement(achievement)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAchievement(achievement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {achievement.description && (
                    <CardContent>
                      <p className="whitespace-pre-wrap">
                        {achievement.description}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter className="text-sm text-muted-foreground">
                    Last updated:{" "}
                    {format(new Date(achievement.updatedAt), "PPP HH:mm")}
                  </CardFooter>
                </Card>
              ))
          )}
        </div>
      </div>
      <AlertDialog
        open={!!achievementToDelete}
        onOpenChange={() => setAchievementToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the achievement &quot;
              {achievementToDelete?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

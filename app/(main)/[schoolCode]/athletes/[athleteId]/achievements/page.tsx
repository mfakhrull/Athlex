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

interface Achievement {
  _id: string;
  title: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Athlete {
  _id: string;
  fullName: string;
  athleteNumber: string;
  achievements: Achievement[];
}

const achievementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  description: z.string().optional(),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

export default function AchievementsPage({
  params,
}: {
  params: Promise<{ schoolCode: string; athleteId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(
    null
  );

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
    },
  });

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
    });
    setShowDialog(true);
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/athletes/${resolvedParams.athleteId}/achievements/${achievementId}`,
        {
          method: "DELETE",
          headers: {
            "x-user-email": "mfakhrull",
          },
        }
      );

      if (response.ok) {
        toast.success("Achievement deleted successfully");
        fetchAthleteData();
      } else {
        toast.error("Failed to delete achievement");
      }
    } catch (error) {
      toast.error("Error deleting achievement");
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
                router.push(`/${resolvedParams.schoolCode}/athletes/${resolvedParams.athleteId}`)
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date()
                              }
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
                      <CardTitle>{achievement.title}</CardTitle>
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
                          onClick={() => handleDeleteAchievement(achievement._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {format(new Date(achievement.date), "PPP")}
                    </CardDescription>
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
    </div>
  );
}
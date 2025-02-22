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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MoreVertical, PencilIcon, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Team name is required" }),
  description: z.string().optional(),
  color: z.string().optional(),
  motto: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function TeamsPage({
  params,
}: {
  params: Promise<{ schoolCode: string }>;
}) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [teamToDelete, setTeamToDelete] = useState<any>(null)


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
      motto: "",
      isActive: true,
    },
  });

  useEffect(() => {
    fetchTeams();
  }, [resolvedParams.schoolCode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const endpoint = editingTeam
        ? `/api/teams/${editingTeam._id}`
        : "/api/teams/create";

      const response = await fetch(endpoint, {
        method: editingTeam ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          schoolCode: resolvedParams.schoolCode,
        }),
      });

      if (response.ok) {
        toast.success(
          editingTeam
            ? "Team updated successfully"
            : "Team created successfully"
        );
        form.reset();
        setEditingTeam(null);
        fetchTeams();
      } else {
        const data = await response.json();
        toast.error("Failed to save team", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error saving team", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(
        `/api/teams?schoolCode=${resolvedParams.schoolCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      toast.error("Failed to fetch teams");
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    form.reset({
      name: team.name,
      description: team.description,
      color: team.color,
      motto: team.motto,
      isActive: team.isActive,
    });
  };

  const handleDelete = async (team: any) => {
    try {
      const response = await fetch(`/api/teams/${team._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Team deleted successfully")
        fetchTeams()
      } else {
        const data = await response.json()
        toast.error("Failed to delete team", {
          description: data.message,
        })
      }
    } catch (error) {
      toast.error("Error deleting team", {
        description: "Please try again later",
      })
    } finally {
      setTeamToDelete(null)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {editingTeam ? "Edit Team" : "Register New Team"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
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
                        placeholder="Enter team description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Color</FormLabel>
                    <div className="flex gap-4">
                      <FormControl>
                        <Input placeholder="Enter team color" {...field} />
                      </FormControl>
                      {field.value && (
                        <div
                          className="w-10 h-10 rounded-full border"
                          style={{ backgroundColor: field.value }}
                        />
                      )}
                    </div>
                    <FormDescription>
                      Enter a color name or hex code (e.g., "Red" or "#FF0000")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Motto</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team motto" {...field} />
                    </FormControl>
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
                        Disable to temporarily hide this team
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

              <div className="flex justify-end gap-4">
                {editingTeam && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingTeam(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : editingTeam
                    ? "Update Team"
                    : "Add Team"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Registered Teams</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No teams registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.motto && (
                            <div className="text-sm text-muted-foreground">
                              {team.motto}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {team.color && (
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: team.color }}
                            />
                          )}
                          {team.color || "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={team.isActive ? "default" : "destructive"}>
                          {team.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(team)}>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setTeamToDelete(team)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AlertDialog open={!!teamToDelete} onOpenChange={() => setTeamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team &quot;{teamToDelete?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDelete(teamToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

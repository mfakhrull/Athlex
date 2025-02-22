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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Check,
  ChevronsUpDown,
  MoreVertical,
  PencilIcon,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgeClassDialog } from "@/components/age-class-dialog";

const formSchema = z.object({
  name: z.string().min(1, { message: "Sport name is required" }),
  type: z.enum(["individual", "team"]),
  description: z.string().optional(),
  maxPlayersPerTeam: z.number().nullable().optional(),
  ageClasses: z.array(z.string()).min(1, "At least one age class is required"),
  isActive: z.boolean().default(true),
});

type Sport = z.infer<typeof formSchema> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  schoolCode: string;
};

export default function SportsPage({
  params,
}: {
  params: Promise<{ schoolCode: string }>;
}) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [sportToDelete, setSportToDelete] = useState<Sport | null>(null);
  const [ageClasses, setAgeClasses] = useState<any[]>([]);
  const [isAgeClassDialogOpen, setIsAgeClassDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "individual",
      description: "",
      maxPlayersPerTeam: null,
      ageClasses: [], // Initialize as empty array
      isActive: true,
    },
  });

  const sportType = form.watch("type");

  useEffect(() => {
    fetchSports();
    fetchAgeClasses();
  }, [resolvedParams.schoolCode]);

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
      toast.error("Failed to fetch age classes");
    }
  };

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
      toast.error("Failed to fetch sports");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const endpoint = editingSport
        ? `/api/sports/${editingSport._id}`
        : "/api/sports/create";

      const response = await fetch(endpoint, {
        method: editingSport ? "PUT" : "POST",
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
          editingSport
            ? "Sport updated successfully"
            : "Sport created successfully"
        );
        form.reset();
        setEditingSport(null);
        fetchSports();
      } else {
        const data = await response.json();
        toast.error("Failed to save sport", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error saving sport", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    form.reset({
      name: sport.name,
      type: sport.type,
      description: sport.description || "",
      maxPlayersPerTeam: sport.maxPlayersPerTeam || null,
      ageClasses: sport.ageClasses?.map((ac: any) => ac._id) || [],
      isActive: sport.isActive,
    });
  };

  const handleDelete = async (sport: Sport) => {
    try {
      const response = await fetch(`/api/sports/${sport._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Sport deleted successfully");
        fetchSports();
      } else {
        const data = await response.json();
        toast.error("Failed to delete sport", {
          description: data.message,
        });
      }
    } catch (error) {
      toast.error("Error deleting sport", {
        description: "Please try again later",
      });
    } finally {
      setSportToDelete(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {editingSport ? "Edit Sport" : "Register New Sport"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sport Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter sport name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sport Type Field */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter sport description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Players Field (for team sports) */}
              {sportType === "team" && (
                <FormField
                  control={form.control}
                  name="maxPlayersPerTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Players per Team</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value);
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Age Classes Field */}
              <FormField
                control={form.control}
                name="ageClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Classes</FormLabel>
                    <div className="flex items-center gap-2">
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
                              {Array.isArray(field.value) &&
                              field.value.length > 0
                                ? `${field.value.length} classes selected`
                                : "Select age classes"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search age classes..." />
                            <CommandList>
                              <CommandEmpty>
                                No age classes found.
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="ml-2"
                                  onClick={() => setIsAgeClassDialogOpen(true)}
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Create New
                                </Button>
                              </CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-64">
                                  {ageClasses.map((ageClass) => {
                                    const selectedValues = Array.isArray(
                                      field.value
                                    )
                                      ? field.value
                                      : [];
                                    const isSelected = selectedValues.includes(
                                      ageClass._id
                                    );

                                    return (
                                      <CommandItem
                                        key={ageClass._id}
                                        value={ageClass._id} // Add this for proper filtering
                                        onSelect={() => {
                                          const currentValues = Array.isArray(
                                            field.value
                                          )
                                            ? field.value
                                            : [];
                                          const newValue = isSelected
                                            ? currentValues.filter(
                                                (id) => id !== ageClass._id
                                              )
                                            : [...currentValues, ageClass._id];
                                          field.onChange(newValue);
                                        }}
                                        className="flex items-center gap-2"
                                      >
                                        <Check
                                          className={cn(
                                            "h-4 w-4",
                                            isSelected
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <span>{ageClass.name}</span>
                                        <span className="text-muted-foreground">
                                          ({ageClass.gender}, {ageClass.minAge}-
                                          {ageClass.maxAge} years)
                                        </span>
                                      </CommandItem>
                                    );
                                  })}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                          <div className="p-2 border-t">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => setIsAgeClassDialogOpen(true)}
                            >
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Create New Age Class
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status Field */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Disable to temporarily hide this sport
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
                {editingSport && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSport(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Saving..."
                    : editingSport
                    ? "Update Sport"
                    : "Add Sport"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* List Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Registered Sports</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No sports registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sports.map((sport) => (
                    <TableRow key={sport._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sport.name}</div>
                          {sport.description && (
                            <div className="text-sm text-muted-foreground">
                              {sport.description}
                            </div>
                          )}
                          {sport.ageClasses?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sport.ageClasses.map((ageClass: any) => (
                                <Badge
                                  key={ageClass._id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {ageClass.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            sport.type === "individual"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {sport.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sport.isActive ? "default" : "destructive"}
                        >
                          {sport.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => handleEdit(sport)}>
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setSportToDelete(sport)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!sportToDelete}
        onOpenChange={() => setSportToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the sport &quot;{sportToDelete?.name}
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleDelete(sportToDelete!)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Age Class Creation Dialog */}
      <AgeClassDialog
        open={isAgeClassDialogOpen}
        onClose={() => setIsAgeClassDialogOpen(false)}
        onSuccess={(newAgeClass) => {
          setAgeClasses((prev) => [...prev, newAgeClass]);
          setIsAgeClassDialogOpen(false);
          // Auto-select the newly created age class
          const currentSelected = form.getValues("ageClasses") || [];
          form.setValue("ageClasses", [...currentSelected, newAgeClass._id]);
        }}
        schoolCode={resolvedParams.schoolCode}
      />
    </div>
  );
}

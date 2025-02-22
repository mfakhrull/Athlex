"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// Update schema to match API validation
const ageClassSchema = z.object({
  name: z.string().min(1, { message: "Class name is required" })
    .regex(/^[LP]\d{1,2}$/, {
      message: "Class name must start with L or P followed by age (e.g., L18, P15)",
    }),
  description: z.string().optional(),
  gender: z.string().refine((val) => val === 'L' || val === 'P', {
    message: "Gender must be either 'L' (Male) or 'P' (Female)",
  }),
  minAge: z.number()
    .min(0, "Minimum age cannot be negative")
    .max(100, "Minimum age cannot exceed 100"),
  maxAge: z.number()
    .min(0, "Maximum age cannot be negative")
    .max(100, "Maximum age cannot exceed 100"),
}).refine((data) => data.maxAge >= data.minAge, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["maxAge"],
});

// Define proper type for the age class
interface AgeClass {
  _id: string;
  name: string;
  description?: string;
  gender: "L" | "P";
  minAge: number;
  maxAge: number;
  schoolCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgeClassDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (ageClass: AgeClass) => void;
  schoolCode: string;
}

export function AgeClassDialog({
  open,
  onClose,
  onSuccess,
  schoolCode,
}: AgeClassDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof ageClassSchema>>({
    resolver: zodResolver(ageClassSchema),
    defaultValues: {
      name: "",
      description: "",
      gender: "L",
      minAge: 0,
      maxAge: 0,
    },
  });

  // Watch gender field to auto-update name prefix
  const gender = form.watch("gender");
  
  const onSubmit = async (values: z.infer<typeof ageClassSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/age-classes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          schoolCode,
          isActive: true, // Add default value
        }),
      });

      if (response.ok) {
        const ageClass = await response.json();
        toast.success("Age class created successfully");
        form.reset();
        onSuccess(ageClass);
      } else {
        const data = await response.json();
        if (data.overlappingClass) {
          toast.error("Age range overlap", {
            description: `Age range overlaps with existing class: ${data.overlappingClass.name}`,
          });
        } else {
          toast.error("Failed to create age class", {
            description: data.message,
          });
        }
      }
    } catch (error) {
      toast.error("Error creating age class", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to handle name field changes
  const handleNameChange = (value: string) => {
    if (value.length === 0) return value;
    
    // If first character is not L or P, keep it unchanged
    if (!/^[LP]/.test(value)) {
      return value;
    }
    
    // Update gender when L or P is typed
    const newGender = value[0] as "L" | "P";
    form.setValue("gender", newGender);
    
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Age Class</DialogTitle>
          <DialogDescription>
            Add a new age class for your school's sports.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter class name (start with L or P)"
                      onChange={(e) => {
                        const value = handleNameChange(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Start with L (Male) or P (Female) followed by age (e.g., L18, P15)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    onValueChange={(value: "L" | "P") => {
                      field.onChange(value);
                      // Update name when gender changes
                      const currentName = form.getValues("name");
                      if (currentName) {
                        form.setValue("name", handleNameChange(currentName));
                      }
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter description" />
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
                  form.reset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Age Class"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
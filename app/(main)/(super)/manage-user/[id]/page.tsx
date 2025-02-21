"use client"

import { useEffect, useState, use } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(["Super Admin", "School Admin", "Guest"]),
  schoolCode: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function ManageUserPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      image: "",
      schoolCode: null,
    },
  })

  const selectedRole = form.watch("role")

  useEffect(() => {
    fetchUser()
  }, [resolvedParams.id])

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/users/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch user")
      }
      const userData = await response.json()
      form.reset(userData)
    } catch (error) {
      toast.error("Failed to load user", {
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (values.role === "School Admin" && !values.schoolCode) {
        form.setError("schoolCode", {
          type: "manual",
          message: "School Code is required for School Admin",
        })
        return
      }

      const response = await fetch(`/api/users/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success("User updated successfully")
        router.push("/users-list")
        router.refresh()
      } else {
        const data = await response.json()
        toast.error("Failed to update user", {
          description: data.message,
        })
      }
    } catch (error) {
      toast.error("Error updating user", {
        description: "Please try again later",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manage User</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={form.getValues("image") || ""} alt="User avatar" />
              <AvatarFallback>{form.getValues("name")?.[0]}</AvatarFallback>
            </Avatar>
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter profile image URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter user name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Enter email address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter phone number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Super Admin">Super Admin</SelectItem>
                    <SelectItem value="School Admin">School Admin</SelectItem>
                    <SelectItem value="Guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schoolCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>School Code</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ""} 
                    placeholder="Enter school code"
                    disabled={selectedRole !== "School Admin"}
                  />
                </FormControl>
                <FormDescription>
                  {selectedRole === "School Admin" 
                    ? "Required for School Admin role" 
                    : "Only applicable for School Admin role"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              onClick={() => router.push("/users-list")}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Plus, PencilIcon } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1, { message: "Sport name is required" }),
  type: z.enum(["individual", "team"]),
  description: z.string().optional(),
  maxPlayersPerTeam: z.number().optional(),
  minAge: z.number().min(0).optional(),
  maxAge: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
})

export default function SportsPage({ params }: { params: { schoolCode: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [sports, setSports] = useState<any[]>([])
  const [editingSport, setEditingSport] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "individual",
      description: "",
      isActive: true,
    },
  })

  const sportType = form.watch("type")

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      const endpoint = editingSport 
        ? `/api/sports/${editingSport._id}` 
        : "/api/sports/create"

      const response = await fetch(endpoint, {
        method: editingSport ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          schoolCode: params.schoolCode,
        }),
      })

      if (response.ok) {
        toast.success(
          editingSport ? "Sport updated successfully" : "Sport created successfully"
        )
        form.reset()
        setEditingSport(null)
        fetchSports()
      } else {
        const data = await response.json()
        toast.error("Failed to save sport", {
          description: data.message,
        })
      }
    } catch (error) {
      toast.error("Error saving sport", {
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSports = async () => {
    try {
      const response = await fetch(`/api/sports?schoolCode=${params.schoolCode}`)
      if (response.ok) {
        const data = await response.json()
        setSports(data)
      }
    } catch (error) {
      toast.error("Failed to fetch sports")
    }
  }

  const handleEdit = (sport: any) => {
    setEditingSport(sport)
    form.reset({
      name: sport.name,
      type: sport.type,
      description: sport.description,
      maxPlayersPerTeam: sport.maxPlayersPerTeam,
      minAge: sport.minAge,
      maxAge: sport.maxAge,
      isActive: sport.isActive,
    })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {editingSport ? "Edit Sport" : "Register New Sport"}
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter sport description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
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
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="flex justify-end gap-4">
                {editingSport && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingSport(null)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingSport ? "Update Sport" : "Add Sport"}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Registered Sports</h2>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.map((sport) => (
                  <TableRow key={sport._id}>
                    <TableCell className="font-medium">{sport.name}</TableCell>
                    <TableCell>
                      <Badge variant={sport.type === "individual" ? "default" : "secondary"}>
                        {sport.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sport.isActive ? "default" : "destructive"}>
                        {sport.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(sport)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventParticipantSchema } from "@/lib/validateEventParticipant"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Loader2 } from "lucide-react"

interface ParticipantFormProps {
  eventId: string
  onSuccess: () => void
  athletes: Array<{
    _id: string
    fullName: string
    athleteNumber: string
    gender: "L" | "P"
    ageClass: string
  }>
  ageClasses: Array<{
    _id: string
    name: string
  }>
}

export function ParticipantForm({
  eventId,
  onSuccess,
  athletes,
  ageClasses,
}: ParticipantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(eventParticipantSchema),
    defaultValues: {
      athlete: "",
      ageClass: "",
      number: "",
      category: "L" as "L" | "P",
      status: "REGISTERED",
    },
  })

  const onSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "mfakhrull",
        },
        body: JSON.stringify({
          participants: [values],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add participant")
      }

      onSuccess()
      form.reset()
    } catch (error) {
      console.error("Error adding participant:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-fill fields when athlete is selected
  const handleAthleteChange = (athleteId: string) => {
    const athlete = athletes.find((a) => a._id === athleteId)
    if (athlete) {
      form.setValue("ageClass", athlete.ageClass)
      form.setValue("category", athlete.gender)
      form.setValue("number", athlete.athleteNumber)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="athlete"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Athlete</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  handleAthleteChange(value)
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select athlete" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {athletes.map((athlete) => (
                    <SelectItem key={athlete._id} value={athlete._id}>
                      {athlete.fullName} ({athlete.athleteNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="L">Male</SelectItem>
                    <SelectItem value="P">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Participant"
          )}
        </Button>
      </form>
    </Form>
  )
}
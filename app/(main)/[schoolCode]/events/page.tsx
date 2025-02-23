"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Event {
  _id: string
  name: string
  sport: {
    _id: string
    name: string
  }
  season: {
    _id: string
    name: string
  }
  date: string
  venue: string
  type: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY"
  status: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED"
  maxParticipants: number
  participants: {
    _id: string
    athlete: {
      _id: string
      fullName: string
    }
  }[]
}

interface EventsPageProps {
  params: Promise<{
    schoolCode: string
  }>
}

export default function EventsPage({ params }: EventsPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Event["status"] | "ALL">("ALL")
  const [typeFilter, setTypeFilter] = useState<Event["type"] | "ALL">("ALL")

  useEffect(() => {
    fetchEvents()
  }, [resolvedParams.schoolCode])

  const fetchEvents = async () => {
    try {
      const queryParams = new URLSearchParams({
        schoolCode: resolvedParams.schoolCode,
        page: "1",
        limit: "10",
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(typeFilter !== "ALL" && { type: typeFilter }),
        ...(search && { search }),
      });
  
      const response = await fetch(`/api/events/event-list?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
        setPagination(data.pagination)
      } else {
        toast.error("Failed to fetch events")
      }
    } catch (error) {
      toast.error("Error loading events")
    } finally {
      setIsLoading(false)
    }
  }

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 10,
  });

  const handleStatusChange = async (eventId: string, newStatus: Event["status"]) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "mfakhrull",
        },
        body: JSON.stringify({ 
          status: newStatus,
          updatedAt: "2025-02-23T10:13:11Z",
          updatedBy: "mfakhrull"
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update event status")
      }

      toast.success("Event status updated successfully")
      fetchEvents()
    } catch (error) {
      toast.error("Error updating event status")
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      search === "" ||
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.sport.name.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || event.status === statusFilter
    const matchesType = typeFilter === "ALL" || event.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadgeVariant = (status: Event["status"]) => {
    switch (status) {
      case "DRAFT":
        return "secondary"
      case "PUBLISHED":
        return "default"
      case "IN_PROGRESS":
        return "destructive"
      case "COMPLETED":
        return "success"
      default:
        return "secondary"
    }
  }

  const getEventTypeIcon = (type: Event["type"]) => {
    switch (type) {
      case "TRACK":
        return "🏃"
      case "FIELD":
        return "🎯"
      case "RELAY":
        return "🏃‍♂️"
      case "CROSS_COUNTRY":
        return "🏃‍♀️"
      default:
        return "🎯"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage your sports events and competitions
          </p>
        </div>
        <Button onClick={() => router.push(`/${resolvedParams.schoolCode}/events/create`)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Status: {statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("DRAFT")}>
              Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("PUBLISHED")}>
              Published
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("IN_PROGRESS")}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Type: {typeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTypeFilter("ALL")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("TRACK")}>
              Track
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("FIELD")}>
              Field
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("RELAY")}>
              Relay
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTypeFilter("CROSS_COUNTRY")}>
              Cross Country
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No events found</p>
          <p className="text-muted-foreground">
            {search || statusFilter !== "ALL" || typeFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first event to get started"}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.sport.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getEventTypeIcon(event.type)}</span>
                      {event.type}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(event.date), "PPP")}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.participants.length} / {event.maxParticipants}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.status)}>
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/${resolvedParams.schoolCode}/events/${event._id}`)
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                        {event.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(event._id, "PUBLISHED")}
                          >
                            Publish Event
                          </DropdownMenuItem>
                        )}
                        {event.status === "PUBLISHED" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(event._id, "IN_PROGRESS")}
                          >
                            Start Event
                          </DropdownMenuItem>
                        )}
                        {event.status === "IN_PROGRESS" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(event._id, "COMPLETED")}
                          >
                            Complete Event
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
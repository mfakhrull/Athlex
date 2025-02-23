"use client"

import * as React from "react"
import {
  AlertCircle,
  Check,
  Loader2,
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Participant {
  _id: string
  athlete: {
    _id: string
    fullName: string
    athleteNumber: string
    gender: "L" | "P"
  }
  ageClass: {
    _id: string
    name: string
  }
  number: string
  category: "L" | "P"
  lane?: number
  order?: number
  heat?: number
  round?: number
  status: "REGISTERED" | "CONFIRMED" | "SCRATCHED" | "DNS" | "DNF" | "DQ"
  result?: {
    position?: number
    time?: string
    distance?: number
    height?: number
    points?: number
    remarks?: string
  }
  createdAt: string
  updatedBy: string
}

interface ParticipantsListProps {
  eventId: string
  participants: Participant[]
  onAddParticipants: () => void
  onParticipantStatusChange: (participantId: string, status: Participant["status"]) => Promise<void>
  onParticipantRemove: (participantId: string) => Promise<void>
  isLoading?: boolean
}

export function ParticipantsList({
  eventId,
  participants,
  onAddParticipants,
  onParticipantStatusChange,
  onParticipantRemove,
  isLoading = false,
}: ParticipantsListProps) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<Participant["status"] | "ALL">("ALL")
  const [actioningParticipant, setActioningParticipant] = React.useState<string | null>(null)

  // Filter participants based on search and status
  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch = search === "" || 
      participant.athlete.fullName.toLowerCase().includes(search.toLowerCase()) ||
      participant.athlete.athleteNumber.toLowerCase().includes(search.toLowerCase()) ||
      participant.number.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || participant.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (participantId: string, newStatus: Participant["status"]) => {
    try {
      setActioningParticipant(participantId)
      await onParticipantStatusChange(participantId, newStatus)
      toast.success("Participant status updated successfully")
    } catch (error) {
      toast.error("Failed to update participant status")
    } finally {
      setActioningParticipant(null)
    }
  }

  const handleRemove = async (participantId: string) => {
    try {
      setActioningParticipant(participantId)
      await onParticipantRemove(participantId)
      toast.success("Participant removed successfully")
    } catch (error) {
      toast.error("Failed to remove participant")
    } finally {
      setActioningParticipant(null)
    }
  }

  const getStatusBadgeProps = (status: Participant["status"]) => {
    switch (status) {
      case "REGISTERED":
        return { variant: "secondary" as const }
      case "CONFIRMED":
        return { variant: "success" as const }
      case "SCRATCHED":
        return { variant: "destructive" as const }
      case "DNS":
        return { variant: "outline" as const }
      case "DNF":
        return { variant: "destructive" as const }
      case "DQ":
        return { variant: "destructive" as const }
      default:
        return { variant: "secondary" as const }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Participants</h2>
          <Badge variant="secondary">
            {participants.length} registered
          </Badge>
        </div>
        <Button onClick={onAddParticipants}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Participants
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Filter by Status
              {statusFilter !== "ALL" && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
              All Statuses
              {statusFilter === "ALL" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {["REGISTERED", "CONFIRMED", "SCRATCHED", "DNS", "DNF", "DQ"].map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setStatusFilter(status as Participant["status"])}
              >
                {status}
                {statusFilter === status && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No participants found</p>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Try adjusting your search or filters"
              : "Add participants to get started"}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age Class</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Heat/Round</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant._id}>
                  <TableCell>{participant.number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{participant.athlete.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {participant.athlete.athleteNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{participant.ageClass.name}</TableCell>
                  <TableCell>{participant.category}</TableCell>
                  <TableCell>
                    {participant.heat && participant.round ? (
                      `Heat ${participant.heat}, Round ${participant.round}`
                    ) : (
                      "Not assigned"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge {...getStatusBadgeProps(participant.status)}>
                      {participant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actioningParticipant === participant._id}
                        >
                          {actioningParticipant === participant._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                      <DropdownMenuItem
                          onClick={() => handleStatusChange(participant._id, "REGISTERED")}
                          disabled={participant.status === "REGISTERED"}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Mark as Registered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(participant._id, "CONFIRMED")}
                          disabled={participant.status === "CONFIRMED"}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Confirm Participation
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(participant._id, "SCRATCHED")}
                          disabled={participant.status === "SCRATCHED"}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Mark as Scratched
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleRemove(participant._id)}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Remove Participant
                        </DropdownMenuItem>
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
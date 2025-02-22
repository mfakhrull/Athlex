"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MoreVertical,
  Search,
  Plus,
  PencilIcon,
  UserX,
  Medal,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Athlete {
  _id: string;
  athleteNumber: string;
  fullName: string;
  icNumber: string;
  dateOfBirth: string;
  gender: "L" | "P";
  team: {
    _id: string;
    name: string;
    color: string;
  };
  image: string;
  ageClass: {
    _id: string;
    name: string;
  };
  sports: {
    sport: {
      _id: string;
      name: string;
    };
    isActive: boolean;
  }[];
  isActive: boolean;
}

export default function AthleteListPage({
  params,
}: {
  params: Promise<{ schoolCode: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAthletes();
  }, [resolvedParams.schoolCode]);

  const fetchAthletes = async () => {
    try {
      const response = await fetch(
        `/api/athletes?schoolCode=${resolvedParams.schoolCode}`
      );
      if (response.ok) {
        const data = await response.json();
        setAthletes(data);
      } else {
        toast.error("Failed to fetch athletes");
      }
    } catch (error) {
      toast.error("Error loading athletes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (
    athleteId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/athletes/${athleteId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchAthletes(); // Refresh the list
        toast.success(
          `Athlete ${currentStatus ? "deactivated" : "activated"} successfully`
        );
      } else {
        toast.error("Failed to update athlete status");
      }
    } catch (error) {
      toast.error("Error updating athlete status");
    }
  };

  const filteredAthletes = athletes.filter((athlete) =>
    Object.values({
      athleteNumber: athlete.athleteNumber,
      fullName: athlete.fullName,
      icNumber: athlete.icNumber,
      ageClass: athlete.ageClass.name,
      sports: athlete.sports.map((s) => s.sport.name).join(" "),
    })
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Athletes</h1>
        <Button
          onClick={() =>
            router.push(`/${resolvedParams.schoolCode}/athletes/register`)
          }
        >
          <Plus className="h-4 w-4 mr-2" />
          Register Athlete
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search athletes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Athlete</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Age Class</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Sports</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2">Loading athletes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAthletes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No athletes found
                </TableCell>
              </TableRow>
            ) : (
              filteredAthletes.map((athlete) => (
                <TableRow key={athlete._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={athlete.image} />
                        <AvatarFallback>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                          >
                            <path d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6 8a6 6 0 1 1 12 0A6 6 0 0 1 6 8zm2 10a3 3 0 0 0-3 3 1 1 0 1 1-2 0 5 5 0 0 1 5-5h8a5 5 0 0 1 5 5 1 1 0 1 1-2 0 3 3 0 0 0-3-3H8z" />
                          </svg>
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{athlete.fullName}</div>
                        <div className="text-sm text-muted-foreground">
                          {athlete.icNumber}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{athlete.athleteNumber}</TableCell>
                  <TableCell>{athlete.ageClass.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: athlete.team.color }}
                      />
                      {athlete.team.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {athlete.sports.map((sport, index) => (
                        <Badge
                          key={index}
                          variant={sport.isActive ? "default" : "secondary"}
                        >
                          {sport.sport.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={athlete.isActive ? "success" : "destructive"}
                    >
                      {athlete.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/${resolvedParams.schoolCode}/athletes/${athlete._id}`
                            )
                          }
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Manage
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/${resolvedParams.schoolCode}/athletes/${athlete._id}/achievements`
                            )
                          }
                        >
                          <Medal className="h-4 w-4 mr-2" />
                          Achievements
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleToggleStatus(athlete._id, athlete.isActive)
                          }
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          {athlete.isActive ? "Deactivate" : "Activate"}
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
  );
}

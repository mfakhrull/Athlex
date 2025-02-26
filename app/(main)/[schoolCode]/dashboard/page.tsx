// app/(main)/[schoolCode]/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, User } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Team {
  _id: string;
  name: string;
  color: string;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
}

interface TopAthlete {
  _id: string;
  athleteNumber: string;
  fullName: string;
  image: string;
  ageClass: string;
  team: {
    name: string;
    color: string;
  };
  medals: {
    gold: number;
    silver: number;
    bronze: number;
    total: number;
  };
}

export default function DashboardPage() {
  const params = useParams();
  const schoolCode = params.schoolCode as string;
  const [teams, setTeams] = useState<Team[]>([]);
  const [topAthletes, setTopAthletes] = useState<TopAthlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAthletes, setIsLoadingAthletes] = useState(true);

  useEffect(() => {
    fetchTeamMedalsData();
    fetchTopAthletesData();
  }, [schoolCode]);

  const fetchTeamMedalsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/dashboard/team-medals?schoolCode=${schoolCode}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch team medals data");
      }
      
      const teamData = await response.json();
      if (!teamData || teamData.length === 0) {
        toast.info("No medal data available yet");
      }
      setTeams(teamData);
    } catch (error) {
      toast.error("Error loading team rankings", {
        description: "Please try again later",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopAthletesData = async () => {
    try {
      setIsLoadingAthletes(true);
      const response = await fetch(`/api/dashboard/top-athletes?schoolCode=${schoolCode}&limit=10`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch top athletes data");
      }
      
      const athletesData = await response.json();
      setTopAthletes(athletesData);
    } catch (error) {
      toast.error("Error loading top athletes", {
        description: "Please try again later",
      });
      console.error(error);
    } finally {
      setIsLoadingAthletes(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Team Rankings */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Team Medal Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">
                      <Badge variant="outline" className="bg-yellow-500/20">🥇</Badge>
                    </TableHead>
                    <TableHead className="text-center">
                      <Badge variant="outline" className="bg-gray-300/20">🥈</Badge>
                    </TableHead>
                    <TableHead className="text-center">
                      <Badge variant="outline" className="bg-amber-700/20">🥉</Badge>
                    </TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team, index) => (
                    <TableRow key={team._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{team.medals.gold}</TableCell>
                      <TableCell className="text-center">{team.medals.silver}</TableCell>
                      <TableCell className="text-center">{team.medals.bronze}</TableCell>
                      <TableCell className="text-center font-medium">{team.medals.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Athletes */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-500" />
              Top Athletes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAthletes ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Athlete</TableHead>
                    <TableHead className="text-center">
                      <Badge variant="outline" className="bg-yellow-500/20">🥇</Badge>
                    </TableHead>
                    <TableHead className="text-center">
                      <Badge variant="outline" className="bg-gray-300/20">🥈</Badge>
                    </TableHead>
                    <TableHead className="text-center">
                      <Badge variant="outline" className="bg-amber-700/20">🥉</Badge>
                    </TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAthletes.map((athlete, index) => (
                    <TableRow key={athlete._id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={athlete.image} alt={athlete.fullName} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{athlete.fullName}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: athlete.team.color }}
                              />
                              {athlete.team.name} · {athlete.ageClass}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{athlete.medals.gold}</TableCell>
                      <TableCell className="text-center">{athlete.medals.silver}</TableCell>
                      <TableCell className="text-center">{athlete.medals.bronze}</TableCell>
                      <TableCell className="text-center font-medium">{athlete.medals.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
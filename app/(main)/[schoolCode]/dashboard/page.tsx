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
import { Trophy, Medal, User, ArrowUp, TrendingUp, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 text-white">1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400 text-white">2nd</Badge>;
      case 3:
        return <Badge className="bg-amber-700 text-white">3rd</Badge>;
      default:
        return <Badge variant="outline">{rank}th</Badge>;
    }
  };

  const getTotalMedals = (teams: Team[]) => {
    return teams.reduce((acc, team) => acc + team.medals.total, 0);
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto p-4 md:p-6 space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track team and athlete performance</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Medals</p>
                  <h3 className="text-2xl font-bold">{getTotalMedals(teams)}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <Medal className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gold Medals</p>
                  <h3 className="text-2xl font-bold">
                    {teams.reduce((acc, team) => acc + team.medals.gold, 0)}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                  <h3 className="text-2xl font-bold">{teams.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Athletes</p>
                  <h3 className="text-2xl font-bold">{topAthletes.length}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Rankings */}
        <motion.div variants={itemVariants}>
          <Card className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Team Medal Standings
                </div>
                <Badge variant="outline" className="font-normal">
                  {teams.length} Teams
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">
                          <span className="text-yellow-500">🥇</span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="text-gray-400">🥈</span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="text-amber-700">🥉</span>
                        </TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team, index) => (
                        <TableRow 
                          key={team._id}
                          className={cn(
                            "transition-colors hover:bg-muted/50",
                            index < 3 && "bg-muted/20"
                          )}
                        >
                          <TableCell className="font-medium">
                            {getRankBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: team.color }}
                              />
                              <span className="font-medium">{team.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{team.medals.gold}</TableCell>
                          <TableCell className="text-center">{team.medals.silver}</TableCell>
                          <TableCell className="text-center">{team.medals.bronze}</TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "font-medium",
                                index === 0 && "bg-yellow-500/20 text-yellow-700",
                                index === 1 && "bg-gray-200 text-gray-700",
                                index === 2 && "bg-amber-500/20 text-amber-700"
                              )}
                            >
                              {team.medals.total}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Athletes */}
        <motion.div variants={itemVariants}>
          <Card className="border-t-4 border-t-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-yellow-500" />
                  Top Athletes
                </div>
                <Badge variant="outline" className="font-normal">
                  Top {topAthletes.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAthletes ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Rank</TableHead>
                        <TableHead>Athlete</TableHead>
                        <TableHead className="text-center">
                          <span className="text-yellow-500">🥇</span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="text-gray-400">🥈</span>
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="text-amber-700">🥉</span>
                        </TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topAthletes.map((athlete, index) => (
                        <TableRow 
                          key={athlete._id}
                          className={cn(
                            "transition-colors hover:bg-muted/50",
                            index < 3 && "bg-muted/20"
                          )}
                        >
                          <TableCell>
                            {getRankBadge(index + 1)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border-2 border-muted">
                                <AvatarImage src={athlete.image} alt={athlete.fullName} />
                                <AvatarFallback className="bg-primary/5">
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
                          <TableCell className="text-right">
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "font-medium",
                                index === 0 && "bg-yellow-500/20 text-yellow-700",
                                index === 1 && "bg-gray-200 text-gray-700",
                                index === 2 && "bg-amber-500/20 text-amber-700"
                              )}
                            >
                              {athlete.medals.total}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
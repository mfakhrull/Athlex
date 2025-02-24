"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Trophy,
  Timer,
  Medal,
  Flag,
  Ban,
} from "lucide-react";

interface Participant {
  _id: string;
  athlete: {
    _id: string;
    fullName: string;
    athleteNumber: string;
  };
  category: "L" | "P";
  status: string;
  result?: {
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
  };
}

interface FinalRound {
  number: number;
  type: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
  startTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  qualifiedParticipantIds: string[];
  results?: {
    participantId: string;
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  }[];
}

interface EventStatisticsProps {
  participants: Participant[];
  eventType: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  finalRound?: FinalRound;
}


export function EventStatistics({ participants, eventType, finalRound }: EventStatisticsProps) {
  const getEffectiveResults = () => {
    if (finalRound?.results) {
      return participants.map(participant => ({
        ...participant,
        result: finalRound.results?.find(r => r.participantId === participant._id) || participant.result
      }));
    }
    return participants;
  };

  const effectiveParticipants = getEffectiveResults();

  // Calculate statistics
  const totalParticipants = participants.length;
  const confirmedParticipants = participants.filter(p => p.status === "CONFIRMED").length;
  const completedResults = effectiveParticipants.filter(p => p.result?.position).length;
  const medalWinners = effectiveParticipants.filter(p => p.result?.position && p.result.position <= 3).length;
  const scratched = participants.filter(p => p.status === "SCRATCHED").length;
  const dnf = participants.filter(p => p.status === "DNF").length;
  const dq = participants.filter(p => p.status === "DQ").length;

  // Get top performers from effective results
  const topPerformers = effectiveParticipants
    .filter(p => p.result?.position)
    .sort((a, b) => (a.result?.position || 0) - (b.result?.position || 0))
    .slice(0, 3);

  // Helper function to get best performance
  const getBestPerformance = () => {
    if (eventType === "TRACK") {
      return effectiveParticipants
        .filter(p => p.result?.time)
        .sort((a, b) => (a.result?.time || "").localeCompare(b.result?.time || ""))[0]
        ?.result?.time || "N/A";
    }
    if (eventType === "FIELD") {
      const bestDistance = Math.max(
        ...effectiveParticipants
          .filter(p => p.result?.distance)
          .map(p => p.result?.distance || 0)
      );
      return bestDistance > 0 ? `${bestDistance} m` : "N/A";
    }
    return "N/A";
  };

  // Calculate total points
  const totalPoints = effectiveParticipants.reduce(
    (sum, p) => sum + (p.result?.points || 0), 
    0
  );


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Participation"
          value={`${confirmedParticipants}/${totalParticipants}`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Confirmed participants"
        />

        <StatCard
          title="Results"
          value={`${completedResults}/${confirmedParticipants}`}
          icon={<Flag className="h-4 w-4 text-muted-foreground" />}
          description="Completed results"
        />

        <StatCard
          title="Medals"
          value={medalWinners}
          icon={<Medal className="h-4 w-4 text-muted-foreground" />}
          description="Medal positions awarded"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((participant) => (
              <div
                key={participant._id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{participant.athlete.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {participant.athlete.athleteNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{participant.category}</Badge>
                  {participant.result?.position === 1 && (
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  )}
                  {participant.result?.position === 2 && (
                    <Medal className="h-4 w-4 text-gray-400" />
                  )}
                  {participant.result?.position === 3 && (
                    <Medal className="h-4 w-4 text-amber-600" />
                  )}
                  {eventType === "TRACK" && participant.result?.time && (
                    <span className="text-sm font-mono">{participant.result.time}</span>
                  )}
                  {eventType === "FIELD" && participant.result?.distance && (
                    <span className="text-sm font-mono">{participant.result.distance}m</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scratched</p>
                <p className="text-2xl font-bold">{scratched}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">DNF</p>
                <p className="text-2xl font-bold">{dnf}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">DQ</p>
                <p className="text-2xl font-bold">{dq}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category breakdown */}
            <div>
              <h4 className="text-sm font-medium mb-2">Category Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Male (L)</p>
                  <p className="text-xl font-bold">
                    {participants.filter(p => p.category === "L").length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Female (P)</p>
                  <p className="text-xl font-bold">
                    {participants.filter(p => p.category === "P").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance metrics */}
            <div>
              <h4 className="text-sm font-medium mb-2">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                {eventType === "TRACK" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Best Time</p>
                    <p className="text-xl font-bold">
                      {participants
                        .filter(p => p.result?.time)
                        .sort((a, b) => (a.result?.time || "").localeCompare(b.result?.time || ""))[0]
                        ?.result?.time || "N/A"}
                    </p>
                  </div>
                )}
                {eventType === "FIELD" && (
                  <div>
                    <p className="text-sm text-muted-foreground">Best Distance</p>
                    <p className="text-xl font-bold">
                      {Math.max(...participants
                        .filter(p => p.result?.distance)
                        .map(p => p.result?.distance || 0))} m
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-xl font-bold">
                    {participants.reduce((sum, p) => sum + (p.result?.points || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Completion rate */}
            <div>
              <h4 className="text-sm font-medium mb-2">Completion Rate</h4>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${(completedResults / confirmedParticipants) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round((completedResults / confirmedParticipants) * 100)}% completed
              </p>
            </div>

            <div className="text-xs text-muted-foreground mt-4">
              Last updated: 2025-02-24 05:39:31 by mfakhrull
              {finalRound && (
                <span className="ml-2">
                  (Final Round: {finalRound.type})
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add helper components for reusability
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Export types for reuse
export type { Participant, EventStatisticsProps };
"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { useSeason } from "@/contexts/SeasonContext";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";

interface Season {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export function SeasonSelector() {
  const { currentSeason, setCurrentSeason } = useSeason();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSeasonDialog, setShowNewSeasonDialog] = useState(false);

  // ... (implement season creation and selection logic)

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentSeason?._id}
        onValueChange={(value) => {
          const season = seasons.find((s) => s._id === value);
          if (season) setCurrentSeason(season);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((season) => (
            <SelectItem key={season._id} value={season._id}>
              {season.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showNewSeasonDialog} onOpenChange={setShowNewSeasonDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Season</DialogTitle>
            <DialogDescription>
              Add a new season for tracking achievements and tournaments.
            </DialogDescription>
          </DialogHeader>
          {/* Add season creation form */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
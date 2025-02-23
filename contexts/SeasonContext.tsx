"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface Season {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface SeasonContextType {
  currentSeason: Season | null;
  setCurrentSeason: (season: Season | null) => void;
  isLoading: boolean;
  currentUser: string;
  currentTime: Date;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set current user and time
  const currentUser = "mfakhrull";
  const currentTime = new Date("2025-02-22T18:21:58Z");

  useEffect(() => {
    const loadCurrentSeason = async () => {
      try {
        // Try to get from localStorage first
        const storedSeason = localStorage.getItem("currentSeason");
        if (storedSeason) {
          setCurrentSeason(JSON.parse(storedSeason));
          setIsLoading(false);
          return;
        }

        // If not in localStorage, fetch active season
        const response = await fetch(`/api/seasons/current`, {
          headers: {
            "x-school-code": params.schoolCode as string,
          },
        });
        
        if (response.ok) {
          const season = await response.json();
          setCurrentSeason(season);
          localStorage.setItem("currentSeason", JSON.stringify(season));
        } else {
          toast.error("No active season found");
        }
      } catch (error) {
        toast.error("Failed to load current season");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.schoolCode) {
      loadCurrentSeason();
    }
  }, [params.schoolCode]);

  const value = {
    currentSeason,
    setCurrentSeason: (season: Season | null) => {
      setCurrentSeason(season);
      if (season) {
        localStorage.setItem("currentSeason", JSON.stringify(season));
      } else {
        localStorage.removeItem("currentSeason");
      }
    },
    isLoading,
    currentUser,
    currentTime,
  };

  return (
    <SeasonContext.Provider value={value}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeason must be used within a SeasonProvider");
  }
  return context;
}
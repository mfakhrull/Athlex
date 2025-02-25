export interface Participant {
    _id: string;
    athlete: {
      _id: string;
      fullName: string;
      athleteNumber: string;
      gender: "L" | "P";
    };
    ageClass: {
      _id: string;
      name: string;
    };
    number: string;
    category: "L" | "P";
    lane?: number;
    order?: number;
    heat?: number;
    round?: number;
    status: "REGISTERED" | "CONFIRMED" | "SCRATCHED" | "DNS" | "DNF" | "DQ";
    result?: {
      position?: number;
      time?: string;
      distance?: number;
      height?: number;
      points?: number;
      remarks?: string;
    };
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  }
  
  export interface Round {
    number: number;
    type: "QUALIFYING" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
    startTime: Date;
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

  export interface BaseResult {
    participantId: string;
    position?: number;
    time?: string;
    distance?: number;
    height?: number;
    points?: number;
    remarks?: string;
  }
  
  export interface RoundResult extends BaseResult {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
  }
  

  
  export interface RoundSchedule {
    eventId: string;
    eventName: string;
    type: EventType;
    roundNumber: number;
    roundType: string;
    startTime: Date;
    status: string;
    venue: string;
  }
  
  export type EventType = "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
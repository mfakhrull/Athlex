import mongoose, { Schema, model } from "mongoose";

export interface EventDocument {
  _id: string;
  schoolCode: string; // Add schoolCode field
  name: string;
  sport: string; // Reference to Sport
  season: string; // Reference to Season
  ageClasses: string[]; // Reference to AgeClass
  categories: ("L" | "P")[]; // Gender categories
  date: Date;
  venue: string;
  type: "TRACK" | "FIELD" | "RELAY" | "CROSS_COUNTRY";
  status: "DRAFT" | "PUBLISHED" | "IN_PROGRESS" | "COMPLETED";
  maxParticipants: number;
  participants: {
    athlete: string; // Reference to Athlete
    ageClass: string; // Reference to AgeClass
    number: string; // Bib/competition number
    category: "L" | "P";
    lane?: number; // For track events
    order?: number; // For field events
    heat?: number;
    round?: number;
    status: "REGISTERED" | "CONFIRMED" | "SCRATCHED" | "DNS" | "DNF" | "DQ";
    result?: {
      position?: number;
      time?: string; // For track events (HH:MM:SS.ms)
      distance?: number; // For throwing/jumping events (meters)
      height?: number; // For high jump (meters)
      points?: number;
      remarks?: string;
    };
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
  }[];
  heats?: {
    number: number;
    startTime: Date;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  }[];
  rounds?: {
    number: number;
    type: "HEATS" | "QUARTERFINAL" | "SEMIFINAL" | "FINAL";
    startTime: Date;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  }[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

const EventSchema = new Schema<EventDocument>({
  schoolCode: {
    type: String,
    required: [true, "School code is required"],
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Event name is required"],
    trim: true,
  },
  sport: {
    type: String,
    required: [true, "Sport is required"],
    ref: "Sport",
  },
  season: {
    type: String,
    required: [true, "Season is required"],
    ref: "Season",
  },
  ageClasses: [{
    type: String,
    ref: "AgeClass",
  }],
  categories: [{
    type: String,
    enum: ["L", "P"],
    required: true,
  }],
  date: {
    type: Date,
    required: [true, "Event date is required"],
  },
  venue: {
    type: String,
    required: [true, "Venue is required"],
  },
  type: {
    type: String,
    enum: ["TRACK", "FIELD", "RELAY", "CROSS_COUNTRY"],
    required: [true, "Event type is required"],
  },
  status: {
    type: String,
    enum: ["DRAFT", "PUBLISHED", "IN_PROGRESS", "COMPLETED"],
    default: "DRAFT",
  },
  maxParticipants: {
    type: Number,
    required: [true, "Maximum participants is required"],
  },
  participants: [{
    athlete: {
      type: String,
      required: true,
      ref: "Athlete",
    },
    ageClass: {
      type: String,
      required: true,
      ref: "AgeClass",
    },
    number: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["L", "P"],
      required: true,
    },
    lane: Number,
    order: Number,
    heat: Number,
    round: Number,
    status: {
      type: String,
      enum: ["REGISTERED", "CONFIRMED", "SCRATCHED", "DNS", "DNF", "DQ"],
      default: "REGISTERED",
    },
    result: {
      position: Number,
      time: String,
      distance: Number,
      height: Number,
      points: Number,
      remarks: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: String,
  }],
  heats: [{
    number: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"],
      default: "SCHEDULED",
    },
  }],
  rounds: [{
    number: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["HEATS", "QUARTERFINAL", "SEMIFINAL", "FINAL"],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED"],
      default: "SCHEDULED",
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: String,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: String,
});

// Update compound index to include schoolCode
EventSchema.index(
  { schoolCode: 1, sport: 1, name: 1 },
  { unique: true }
);

const Event = mongoose.models?.Event || model<EventDocument>("Event", EventSchema);

export default Event;
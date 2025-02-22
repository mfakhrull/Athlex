import mongoose, { Schema, model } from "mongoose";

export interface AthleteDocument {
  _id: string;
  athleteNumber: string; // Will be filled by School Admin
  fullName: string;
  icNumber: string;
  dateOfBirth: Date;
  gender: "L" | "P";
  schoolCode: string; // Reference to School
  team: string; // Reference to Team (Rumah Sukan)
  image: string;
  ageClass: string; // Reference to AgeClass
  sports: {
    sport: string; // Reference to Sport
    joinedAt: Date;
    isActive: boolean;
  }[];
  guardianName?: string;
  guardianContact?: string;
  guardianEmail?: string;
  address?: string;
  medicalConditions?: string[];
  emergencyContact?: string;
  isActive: boolean;
  achievements?: {
    title: string;
    date: Date;
    description: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AthleteSchema = new Schema<AthleteDocument>(
  {
    athleteNumber: {
      type: String,
      required: [true, "Athlete number is required"],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    icNumber: {
      type: String,
      required: [true, "IC number is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    gender: {
      type: String,
      enum: ["L", "P"],
      required: [true, "Gender is required"],
    },
    schoolCode: {
      type: String,
      required: [true, "School code is required"],
      ref: "School",
    },
    team: {
      type: String,
      required: [true, "Team is required"],
      ref: "Team",
    },
    image: {
      type: String,
      default: "",
    },
    ageClass: {
      type: String,
      required: [true, "Age class is required"],
      ref: "AgeClass",
    },
    sports: [{
      sport: {
        type: String,
        required: true,
        ref: "Sport",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    guardianName: String,
    guardianContact: String,
    guardianEmail: String,
    address: String,
    medicalConditions: [String],
    emergencyContact: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    achievements: [{
      title: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      description: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Create compound index for schoolCode and athleteNumber
AthleteSchema.index({ schoolCode: 1, athleteNumber: 1 }, { unique: true });

// Create compound index for schoolCode and icNumber
AthleteSchema.index({ schoolCode: 1, icNumber: 1 }, { unique: true });

const Athlete = mongoose.models?.Athlete || model<AthleteDocument>("Athlete", AthleteSchema);

export default Athlete;
import mongoose, { Schema, model } from "mongoose";

export interface TeamDocument {
  _id: string;
  name: string;
  schoolCode: string; // Reference to School
  description?: string;
  isActive: boolean;
  color?: string; // House color
  motto?: string; // Team motto
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<TeamDocument>(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
    },
    schoolCode: {
      type: String,
      required: [true, "School code is required"],
      ref: "School",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: "", // Optional team color
    },
    motto: {
      type: String,
      default: "", // Optional team motto
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique team names within a school
TeamSchema.index({ schoolCode: 1, name: 1 }, { unique: true });

const Team = mongoose.models?.Team || model<TeamDocument>("Team", TeamSchema);

export default Team;
import mongoose, { Schema, model } from "mongoose";

export interface SportDocument {
  _id: string;
  name: string;
  type: "individual" | "team";
  schoolCode: string; // Reference to school
  description?: string;
  maxPlayersPerTeam?: number; // For team sports
  minAge?: number;
  maxAge?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SportSchema = new Schema<SportDocument>(
  {
    name: {
      type: String,
      required: [true, "Sport name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["individual", "team"],
      required: [true, "Sport type is required"],
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
    maxPlayersPerTeam: {
      type: Number,
      required: function() {
        return this.type === "team";
      },
    },
    minAge: {
      type: Number,
      default: 0,
    },
    maxAge: {
      type: Number,
      default: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Sport = mongoose.models?.Sport || model<SportDocument>("Sport", SportSchema);

export default Sport;
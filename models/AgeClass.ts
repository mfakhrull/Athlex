import mongoose, { Schema, model } from "mongoose";

export interface AgeClassDocument {
  _id: string;
  name: string; // e.g., "L18", "P15"
  description: string;
  gender: "L" | "P"; // L for male, P for female
  minAge: number;
  maxAge: number;
  schoolCode: string; // Reference to school
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AgeClassSchema = new Schema<AgeClassDocument>(
  {
    name: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["L", "P"],
      required: [true, "Gender is required"],
    },
    minAge: {
      type: Number,
      required: [true, "Minimum age is required"],
    },
    maxAge: {
      type: Number,
      required: [true, "Maximum age is required"],
    },
    schoolCode: {
      type: String,
      required: [true, "School code is required"],
      ref: "School",
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

const AgeClass = mongoose.models?.AgeClass || model<AgeClassDocument>("AgeClass", AgeClassSchema);

export default AgeClass;
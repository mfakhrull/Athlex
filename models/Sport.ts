import mongoose, { Schema, model } from "mongoose";

export interface SportDocument {
  _id: string;
  name: string;
  type: "individual" | "team";
  schoolCode: string;
  description?: string;
  maxPlayersPerTeam?: number;
  ageClasses: string[]; // Array of AgeClass IDs
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
    ageClasses: [{
      type: String,
      ref: "AgeClass",
    }],
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
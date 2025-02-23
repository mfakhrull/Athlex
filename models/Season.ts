import mongoose, { Schema, model } from "mongoose";

export interface SeasonDocument {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  schoolCode: string; // Reference to School
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SeasonSchema = new Schema<SeasonDocument>(
  {
    name: {
      type: String,
      required: [true, "Season name is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
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

// Ensure season dates are valid
SeasonSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Create compound index for schoolCode and name
SeasonSchema.index({ schoolCode: 1, name: 1 }, { unique: true });

const Season = mongoose.models?.Season || model<SeasonDocument>("Season", SeasonSchema);

export default Season;
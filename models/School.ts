import mongoose, { Schema, model } from "mongoose";

export interface SchoolDocument {
  _id: string;
  name: string;
  schoolCode: string; // Unique code for the school
  logo: string;
  address: string;
  contact: {
    contactPerson: string; // Name of the contact person
    contactPhone: string; // Contact phone number
    contactEmail: string; // Contact email address
  };
  isActive: boolean; // Add status field
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<SchoolDocument>(
  {
    name: {
      type: String,
      required: [true, "School name is required"],
      unique: true,
    },
    schoolCode: {
      type: String,
      required: [true, "School code is required"],
      unique: true, // Ensure the school code is unique for each school
    },
    logo: {
      type: String,
      default: "", // Optional
    },
    address: {
      type: String,
      required: [true, "School address is required"],
    },
    contact: {
      contactPerson: {
        type: String,
        required: [true, "Contact person is required"], // Contact person's name
      },
      contactPhone: {
        type: String,
        required: [true, "Contact phone is required"], // Contact phone number
      },
      contactEmail: {
        type: String,
        required: [true, "Contact email is required"], // Contact email address
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          "Email is invalid",
        ],
      },
    },
    isActive: {
      type: Boolean,
      default: true, // New schools are active by default
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const School =
  mongoose.models?.School || model<SchoolDocument>("School", SchoolSchema);

export default School;

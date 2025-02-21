import mongoose, { Schema, model } from "mongoose";

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  image: string;
  role: "Super Admin" | "School Admin" | "Guest";  // New role field
  schoolCode: string | null; // Field to store the school ID
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    image: {
      type: String,
      default: "", // Optional profile image field
    },
    role: {
      type: String,
      enum: ["Super Admin", "School Admin", "Guest"], // Limiting role to valid options
      default: "Guest", // Default to "Guest"
    },
    phone: {
      type: String,
      default: "", 
    },
    schoolCode: {
      type: String,
      ref: "School", // Reference to the School collection
      required: function() { return this.role === "School Admin"; }, // Only required if user is a School Admin
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || model<UserDocument>("User", UserSchema);

export default User;

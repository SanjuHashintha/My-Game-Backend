import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    haveTeam: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String, // URL or path to the profile picture
      default: "", // Default value if no profile picture is uploaded
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

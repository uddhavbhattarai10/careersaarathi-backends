const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["employer", "jobseeker", "admin"],
      required: true,
    },
    verificationCode: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String },
  },
  { timestamps: true }
); // Add timestamps option here

const User = mongoose.model("User", userSchema);

module.exports = User;

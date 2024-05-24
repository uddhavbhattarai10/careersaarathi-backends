const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AppliedJob",
      required: true,
      unique: true,
    },

    Address: String,
    jobTitle: String,
    companyName: String,
    Date: String,
    Time: String,
    Phone: String,
  },
  { timestamps: true }
);

const User = mongoose.model("Interview", interviewSchema);

module.exports = User;

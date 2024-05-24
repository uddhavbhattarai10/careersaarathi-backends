const mongoose = require("mongoose");

const appliedJobSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    isInterview: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Create the Model
const AppliedJob = mongoose.model("AppliedJob", appliedJobSchema);

// Export the model
module.exports = AppliedJob;

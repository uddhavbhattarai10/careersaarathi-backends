const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: Number, // Or String, depending on how you handle salary
      required: true,
    },
    skills: {
      type: [String], // Array of strings for skills, education, etc.
      required: true,
    },
    qualificationHighest: {
      type: [String],
      required: true,
    },
    experienceYears: {
      type: Number, // Or you can use a different structure (e.g., Number for years)
      required: true,
    },
    requireEmployee: {
      type: Number, // Or you can use a different structure (e.g., Number for years)
      required: true,
    },
    jobType: {
      type: String,
      enum: [
        "Full-Time",
        "Part-Time",
        "Contract",
        "Freelance",
        "Internship",
        "Temporary",
      ], // Example job types
      required: true,
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: true,
    },
    aboutJob: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: [String],
      required: true,
    },
    preferredQualifications: {
      type: [String],
    },
    additionalInformation: {
      type: [String],
    },
    howToApply: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);

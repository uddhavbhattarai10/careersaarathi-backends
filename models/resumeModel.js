const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Resume schema
const resumeSchema = new Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    picture: {
      type: String,
    },
    pdfFile: {
      type: String,
    },
    summary: { type: String, required: true },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    linkedInProfile: { type: String },
    address: { type: String },

    skills: [{ type: String, required: true }],
    hobbies: [{ type: String, required: true }],
    workExperience: [
      {
        companyName: { type: String, required: true },
        jobTitle: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        responsibilities: [{ type: String }],
      },
    ],
    education: [
      {
        institutionName: { type: String, required: true },
        degreeEarned: { type: String, required: true },
        startDate: { type: Date, required: true },
        graduationDate: { type: Date, required: true },
        academicAchievements: [{ type: String }],
      },
    ],
    certifications: [{ type: String }],
    projects: [
      {
        projectName: { type: String, required: true },
        role: { type: String },
        projectObjective: { type: String },
        outcomes: [{ type: String }],
      },
    ],
    awardsAndHonors: [{ type: String }],
    languages: [{ type: String }],
    result: {
      // Changed "Result" to "result"a
      type: String,
      enum: ["Accept", "Reject", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Create the Resume model
const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;

const express = require("express");
const User = require("../models/userModel"); // Assuming your user model file is in the "models" folder
const router = express.Router();
const CompanyProfile = require("../models/companyModel");
const Resume = require("../models/resumeModel");
const { transporter } = require("../config/nodemailer");

exports.getJobseekerUsersWithResume = async (req, res) => {
  try {
    // Find jobseeker users sorted by creation date
    const jobseekerUsers = await User.find({ role: "jobseeker" }).sort({
      createdAt: -1,
    });

    // Populate resumes for jobseeker users
    const populatedJobseekerUsers = await Promise.all(
      jobseekerUsers.map(async (user) => {
        const resume = await Resume.findOne({ profile: user._id }); // Assuming user._id is referenced in the profile field of Resume model
        return { user, resume };
      })
    );

    res.json(populatedJobseekerUsers);
  } catch (error) {
    console.error("Error fetching jobseeker users with resumes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getEmployerUsersWithCompanyProfiles = async (req, res) => {
  try {
    // Find employer users sorted by creation date
    const employerUsers = await User.find({ role: "employer" }).sort({
      createdAt: -1,
    });

    // Populate company profiles for employer users
    const populatedEmployerUsers = await Promise.all(
      employerUsers.map(async (user) => {
        const companyProfile = await CompanyProfile.findOne({ user: user._id }); // Assuming user._id is referenced in the user field of CompanyProfile model
        return { user, companyProfile };
      })
    );

    res.json(populatedEmployerUsers);
  } catch (error) {
    console.error(
      "Error fetching employer users with company profiles:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getJobseekerProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const resume = await Resume.findById({ _id: userId });

    if (!resume) {
      console.error("No resume found for user:", userId);
      return res
        .status(404)
        .json({ message: "Resume not found for this user." });
    }

    res.status(200).json({ data: resume });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getCompanyProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const company = await CompanyProfile.findById({ _id: userId });

    if (!company) {
      console.error("No company found for user:", userId);
      return res
        .status(404)
        .json({ message: "company not found for this user." });
    }
    res.status(200).json({ data: company });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Controller function to ban a user
exports.banUser = async (req, res) => {
  // Ensure userId is received correctly
  const userId = req.params.id; // Corrected from req.params.id
  const { banReason } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's isBanned and banReason fields
    user.isBanned = true;
    user.banReason = banReason;

    // Send ban reason email
    await sendBanReasonEmail(user.email, banReason);

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: "User banned successfully" });
  } catch (error) {
    console.error("Error banning user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// Function to send ban reason email
async function sendBanReasonEmail(userEmail, banReason) {
  try {
    await transporter.sendMail({
      from: "careersarathifyp@gmail.com",
      to: userEmail,
      subject: "Your account has been banned",
      text: `We regret to inform you that your account has been banned due to the following reason: ${banReason}. Please contact support for further assistance.`,
      // You can add more details or HTML content as per your requirement
    });
    console.log("Ban reason email sent successfully to:", userEmail);
  } catch (error) {
    console.error("Error sending ban reason email:", error);
    throw error;
  }
}

// Function to send unban email
async function sendUnbanEmail(userEmail) {
  try {
    await transporter.sendMail({
      from: "careersarathifyp@gmail.com",
      to: userEmail,
      subject: "Your account has been unbanned",
      text: "We are pleased to inform you that your account has been unbanned. You can now access your account as usual. If you have any questions, please contact support for assistance.",
      // You can add more details or HTML content as per your requirement
    });
    console.log("Unban email sent successfully to:", userEmail);
  } catch (error) {
    console.error("Error sending unban email:", error);
    throw error;
  }
}

// Controller function to unban a user
exports.unbanUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user is already unbanned
    if (!user.isBanned) {
      return res.status(400).json({ message: "User is not banned" });
    }

    // Update user's isBanned field to false
    user.isBanned = false;
    // Clear ban reason
    user.banReason = undefined;

    // Send unban email
    await sendUnbanEmail(user.email);

    // Save the updated user
    await user.save();

    return res.status(200).json({ message: "User unbanned successfully" });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const CompanyProfile = require("../models/companyModel");
const Job = require("../models/jobModel");
const Resume = require("../models/resumeModel");
const AppliedJob = require("../models/appliedJobModel");
const { transporter } = require("../config/nodemailer");

async function sendVerificationEmail(email, verificationCode) {
  try {
    const mailOptions = {
      from: '"Career Sarathi" <careersarathifyp@gmail.com>',
      to: email,
      subject: "Email Verification",
      text: "Thank you for registering with us! Please use the following verification code:",
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };
    console.log("Uddhav", mailOptions);
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending interview email:", error);
    throw error;
  }
}

// Controller to handle user registration with email verification
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const passwordRegex = /^.{8,}$/;

    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      verificationCode,
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationCode);

    // sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: "User registered successfully. Verification email sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Wrong credentials for email" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Wrong Password" });
    }
    console.log(user.isVerified);
    if (!user.isVerified) {
      return res.status(401).json({
        message:
          "Email not verified. Please check your email for verification instructions.",
        isVerified: false, // Send a boolean indicating the verification status
      });
    }
    if (user.isBanned) {
      return res.status(401).json({ message: "Your account has been banned." });
    }

    // Update the updatedAt timestamp for the user
    user.updatedAt = Date.now();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // Set the token as a cookie in the response
    res.cookie("authToken", token, { expiresIn: 3600000, httpOnly: true }); // 'authToken' is the cookie name

    // Find the profile based on the user's role
    let profile;
    if (user.role === "jobseeker") {
      profile = await Resume.findOne({ profile: user._id });
    } else if (user.role === "employer") {
      profile = await CompanyProfile.findOne({ user: user._id });
    }

    // Send the role and profile along with the response
    res.status(200).json({ role: user.role, profile: !!profile, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to handle email verification
exports.verifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email, verificationCode });
    if (!user) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updateUserPassword = async (req, res) => {
  try {
    // Extract userId from request parameters
    const userId = req.user.userId;
    console.log("userid", userId);

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the provided current password matches the password in the database
    const currentPasswordMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!currentPasswordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    // Update user's password
    user.password = hashedPassword;

    // Save the updated user
    await user.save();

    // Respond with success message
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationCode = verificationCode;
    await user.save();

    // Send verification code using the transporter
    await transporter.sendMail({
      from: '"Career Sarathi" <careersarathifyp@gmail.com>',
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    });

    res.status(200).json({
      message: "Verification code sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyVerificationCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({
        message: "Invalid verification code. Please check and try again.",
      });
    }

    res.status(200).json({ message: "Verification Completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateForgotPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the password
    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteJobseeker = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== "jobseeker") {
      return res
        .status(404)
        .json({ message: "User not found or not a jobseeker" });
    }

    const resume = await Resume.findOne({ profile: userId });
    if (!resume) {
      return res
        .status(404)
        .json({ message: "Resume not found for this user" });
    }

    await AppliedJob.deleteMany({ resume: resume._id });
    await Resume.findByIdAndDelete(resume._id);
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting jobseeker:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.deleteEmployer = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findOne({ _id: userId, role: "employer" });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Employer not found or unauthorized",
      });
    }

    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found" });
    }

    // Delete applied jobs where company matches companyProfile._id
    await AppliedJob.deleteMany({ company: companyProfile._id });

    // Delete jobs associated with the company
    await Job.deleteMany({ company: companyProfile._id });

    // Delete company profile
    await CompanyProfile.deleteOne({ _id: companyProfile._id });

    // Delete user
    await User.deleteOne({ _id: user._id });

    res.json({
      success: true,
      message: "Employer account and associated data deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      path: "/",
      domain: "localhost",
      secure: true,
      sameSite: "None",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

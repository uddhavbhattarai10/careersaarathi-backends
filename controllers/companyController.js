const CompanyProfile = require("../models/companyModel");
const Resume = require("../models/resumeModel");
const User = require("../models/userModel");
const uploadOnCloudinary = require("../config/cloudinary");

// Controller to create a new Company Profile
exports.createCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== "employer") {
      return res.status(403).json({
        message: "Access denied. Only employers can create company profiles.",
      });
    }

    const existingProfile = await CompanyProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).json({
        message: "Company profile already exists. Use the update route.",
      });
    }

    const newProfile = new CompanyProfile({ user: userId, ...req.body });

    // Handle picture upload if available
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result || !result.url) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload picture.",
        });
      }
      newProfile.picture = result.url;
    }

    await newProfile.save();

    res.status(201).json({
      message: "Company profile created successfully.",
      data: newProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Controller to update an existing Company Profile
exports.updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== "employer") {
      return res.status(403).json({
        message:
          "Access denied. Only employers can create or update company profiles.",
      });
    }

    let existingProfile = await CompanyProfile.findOne({ user: userId });

    if (!existingProfile) {
      // Create a new profile if it doesn't exist
      existingProfile = new CompanyProfile({ user: userId });
    }

    existingProfile.set(req.body);

    // Handle picture upload if available
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      if (!result || !result.url) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload picture.",
        });
      }
      existingProfile.picture = result.url;
    }

    await existingProfile.save();

    res.status(existingProfile.isNew ? 201 : 200).json({
      message: existingProfile.isNew
        ? "Company profile created successfully."
        : "Company profile updated successfully.",
      data: existingProfile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Controller to get company profile for the current user
exports.getCompanyProfileForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const companyProfile = await CompanyProfile.findOne({ user: userId });

    if (!companyProfile) {
      return res
        .status(404)
        .json({ message: "Company profile not found for this user." });
    }

    res.status(200).json({ data: companyProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.totalInfo = async (req, res) => {
  try {
    const totalCompanyProfiles = await CompanyProfile.countDocuments();
    const totalResumes = await Resume.countDocuments();

    return res.status(200).json({ totalCompanyProfiles, totalResumes });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
exports.getAllCompanyProfiles = async (req, res) => {
  try {
    let query = {};

    // Implement search functionality if search query is provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query = { name: { $regex: searchRegex } };
    }

    // If no search query is provided, return all company profiles
    const companyProfiles = await CompanyProfile.find(query);

    res.json(companyProfiles);
  } catch (error) {
    console.error("Error fetching company profiles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

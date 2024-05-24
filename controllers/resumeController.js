const uploadOnCloudinary = require("../config/cloudinary");
const Resume = require("../models/resumeModel");
const User = require("../models/userModel");

// Controller to create a new Resume
exports.createResume = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Access denied. Only Jobseeker can create Resume." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingResume = await Resume.findOne({ profile: userId });
    if (existingResume) {
      return res
        .status(400)
        .json({ message: "Resume already exists. Use the update route." });
    }

    const newResume = new Resume({ profile: userId });

    // Set resume properties based on the request body
    Object.assign(newResume, req.body);

    // If you have a picture in the request, you can handle it similarly
    if (req.picture) {
      const result = await uploadOnCloudinary.uploader.upload(req.picture.path);
      newResume.picture = result.url;
    }

    await newResume.save();

    res
      .status(201)
      .json({ message: "Resume created successfully.", resume: newResume });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Controller to update an existing Resume
exports.updateResume = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let resume = await Resume.findOne({ profile: userId });
    if (!resume) {
      // If resume doesn't exist, create a new one
      const newResume = new Resume({ profile: userId, ...req.body });

      // Upload image to uploadOnCloudinary if provided
      if (req.file) {
        const result = await uploadOnCloudinary(req.file.path);
        newResume.picture = result.url;
      }

      // Save the new resume
      await newResume.save();

      return res
        .status(201)
        .json({ message: "Resume created successfully.", resume: newResume });
    }

    // If resume exists, update it
    Object.assign(resume, req.body);

    // Upload image to uploadOnCloudinary if provided
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      resume.picture = result.url;
    }

    // Save the updated resume
    await resume.save();

    res.status(200).json({ message: "Resume updated successfully.", resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to search for resumes based on certain criteria
exports.searchResumes = async (req, res) => {
  try {
    // You can define your search criteria based on the request parameters
    const searchCriteria = req.query; // Assuming the search criteria are passed as query parameters

    const resumes = await Resume.find(searchCriteria);

    res
      .status(200)
      .json({ message: "Resumes retrieved successfully.", resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.getResumeForCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const resume = await Resume.findOne({ profile: userId });

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
exports.uploadPdf = (req, res) => {
  const userId = req.user.userId;
  const filePath = req.file.path; // Path where the file is stored
  // Save the file path to the user's resume
  Resume.findOneAndUpdate(
    { profile: userId },
    { $set: { pdfFile: filePath } },
    { new: true }
  )
    .then((resume) => {
      res.json({
        success: true,
        message: "PDF uploaded successfully",
        resume,
      });
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: "Failed to upload PDF",
        error: err,
      });
    });
};

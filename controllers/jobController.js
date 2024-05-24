const AppliedJob = require("../models/appliedJobModel");

const User = require("../models/userModel");
const CompanyProfile = require("../models/companyModel");
const Job = require("../models/jobModel");
const Resume = require("../models/resumeModel");

exports.createJob = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    if (role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only employers can create jobs.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Please create  profile before  posting Job Vacancy.",
      });
    }

    const jobData = {
      company: companyProfile._id,
      ...req.body,
    };

    const job = await Job.create(jobData);

    return res
      .status(201)
      .json({ success: true, message: "Job created successfully.", data: job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
exports.getJobsByUser = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    if (role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only employers can view jobs.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    // Get all jobs associated with the company profile
    const jobs = await Job.find({ company: companyProfile._id }).sort({
      datePosted: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully.",
      data: jobs,
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

exports.updateJobById = async (req, res) => {
  const jobId = req.params.id; // Assuming the job ID is passed as a parameter in the request URL
  const userId = req.user.userId;
  const role = req.user.role;
  const updateData = req.body; // Assuming the new job data is passed in the request body

  try {
    if (role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only employers can update jobs.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    // Check if the job belongs to the company
    const job = await Job.findOne({ _id: jobId, company: companyProfile._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or does not belong to the company.",
      });
    }

    // Update job data
    Object.assign(job, updateData);
    await job.save();

    return res
      .status(200)
      .json({ success: true, message: "Job updated successfully.", data: job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.deleteJobById = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    if (role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only employers can view jobs.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    const jobId = req.params.id;
    const job = await Job.findOne({ _id: jobId, company: companyProfile._id });

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    // Delete the job
    await Job.deleteOne({ _id: jobId });

    // Delete AppliedJobs related to the deleted job
    await AppliedJob.deleteMany({ job: jobId });

    res.status(200).json({
      success: true,
      message: "Job retrieved and/or deleted successfully.",
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

// Get all jobs
exports.getAllJobsWithCompanyDetails = async (req, res) => {
  try {
    // Retrieve jobs that are accepted, have a deadline greater than or equal to the current date,
    // and the associated user is not banned
    const jobs = await Job.find({})
      .populate({
        path: "company",
        populate: {
          path: "user",
          model: "User",
          match: { isBanned: false }, // Filter out the banned users
        },
      })
      .sort({ datePosted: -1 })
      .exec();

    // Filter out the jobs where the associated user is banned
    const filteredJobs = jobs.filter((job) => job.company && job.company.user); // Call the validJobs function

    res.status(200).json({ success: true, data: filteredJobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.getAllJobsWithApplicant = async (req, res) => {
  try {
    // Retrieve jobs that are accepted, have a deadline greater than or equal to the current date,
    // and the associated user is not banned
    const jobs = await Job.find({ status: "Accepted" }) // Filter jobs with status "Accepted"
      .populate({
        path: "company",
        populate: {
          path: "user",
          model: "User",
          match: { isBanned: false }, // Filter out the banned users
        },
      })
      .sort({ datePosted: -1 })
      .exec();

    // Filter out the jobs where the associated user is banned
    const filteredJobs = jobs.filter((job) => job.company && job.company.user);

    res.status(200).json({ success: true, data: filteredJobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function validJob() {
  try {
    const currentDate = new Date(); // Get the current date

    // Retrieve jobs that are accepted, have a deadline greater than or equal to the current date,
    // and the associated user is not banned
    const jobs = await Job.find({
      status: "Accepted",
      deadline: { $gte: currentDate },
    })
      .populate({
        path: "company",
        populate: {
          path: "user",
          model: "User",
          match: { isBanned: false }, // Filter out the banned users
        },
      })
      .sort({ datePosted: -1 })
      .exec();

    // Filter out the jobs where the associated user is banned
    const filteredJobs = jobs.filter((job) => job.company && job.company.user);

    return filteredJobs; // Return the filtered jobs
  } catch (error) {
    throw new Error(error.message);
  }
}

exports.getALlJobs = async (req, res) => {
  try {
    const {
      keyword,
      skill,
      location,
      jobType,
      page = 1,
      limit = 5,
    } = req.query;

    // Construct the query object for search
    const searchQuery = { status: "Accepted" }; // Only consider jobs with status "Accepted"

    if (keyword) {
      searchQuery.$or = [{ title: { $regex: keyword, $options: "i" } }];
    }

    if (skill) searchQuery.skills = skill;
    if (location)
      searchQuery.location = new RegExp(
        location.replace(/,/g, "\\s*,\\s*"),
        "i"
      );
    if (jobType) searchQuery.jobType = jobType;

    // Retrieve total count of valid jobs for pagination
    const totalCount = await Job.countDocuments(searchQuery);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Retrieve valid jobs with pagination
    const skip = (page - 1) * limit;
    const validJobs = await Job.find(searchQuery)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "company",
        populate: {
          path: "user",
          model: "User",
          match: { isBanned: false }, // Filter out the banned users
        },
      })
      .sort({ datePosted: -1 })
      .exec();

    // Retrieve distinct values for skills, locations, job types, and job titles from the valid jobs
    const availableSkills = [
      ...new Set(validJobs.flatMap((job) => job.skills)),
    ];
    let availableLocations = [
      ...new Set(validJobs.flatMap((job) => job.location)),
    ];

    // Filter locations based on selected skills
    if (skill) {
      availableLocations = availableLocations.filter((loc) =>
        validJobs.some(
          (job) => job.skills.includes(skill) && job.location.includes(loc)
        )
      );
    }

    const availableJobTypes = [
      ...new Set(validJobs.flatMap((job) => job.jobType)),
    ];
    const availableJobTitles = [
      ...new Set(validJobs.flatMap((job) => job.title)),
    ];

    // Normalize location strings by removing spaces before commas
    const normalizedLocations = availableLocations.map((loc) =>
      loc.replace(/\s*,\s*/g, ",")
    );

    // Remove duplicate values for each filter
    const uniqueSkills = [...new Set(availableSkills)];
    const uniqueLocations = [...new Set(normalizedLocations)];
    const uniqueJobTypes = [...new Set(availableJobTypes)];
    const uniqueJobTitles = [...new Set(availableJobTitles)];

    // Send response with filtered jobs, filter options, total pages, and current page
    res.status(200).json({
      success: true,
      data: validJobs,
      filters: {
        skills: uniqueSkills,
        locations: uniqueLocations,
        jobTypes: uniqueJobTypes,
        jobTitles: uniqueJobTitles,
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

exports.updateJobStatus = async (req, res) => {
  const jobId = req.params.id;
  const { status } = req.body; // Extract the status field from the request body

  try {
    // Find the job by its ID and update its status
    const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Send the updated job object as response
    res.json({ message: "Job status updated successfully", job });
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.jobById = async (req, res) => {
  try {
    const jobId = req.params.id;

    if (!jobId) {
      return res
        .status(404)
        .json({ success: false, message: "Job ID not provided." });
    }

    // Fetch job details from the database using jobId
    const job = await Job.findById(jobId).populate("company");

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

exports.totaljobCompany = async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    if (role !== "employer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only employers can view jobs.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const companyProfile = await CompanyProfile.findOne({ user: userId });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company profile not found." });
    }

    // Get all jobs associated with the company profile
    const jobs = await Job.find({ company: companyProfile._id });

    // Count the total number of jobs
    const totalJobsPosted = jobs.length;

    // Count the total number of accepted jobs
    const totalAcceptedJobs = jobs.filter(
      (job) => job.status === "Accepted"
    ).length;

    // Count the total number of rejected jobs
    const totalRejectedJobs = jobs.filter(
      (job) => job.status === "Rejected"
    ).length;

    return res.status(200).json({
      success: true,
      message: "Jobs retrieved successfully.",
      data: {
        totalJobsPosted,
        totalAcceptedJobs,
        totalRejectedJobs,
        jobs,
      },
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

//Search Job

exports.searchJobs = async (req, res) => {
  try {
    const { keyword, skill, location, jobType } = req.query;

    // Construct the query object
    const query = {
      status: "Accepted",
      $or: [{ title: { $regex: keyword, $options: "i" } }],
    };

    if (skill) query.skills = skill;
    if (location)
      query.location = new RegExp(location.replace(/,/g, "\\s*,\\s*"), "i");
    if (jobType) query.jobType = jobType;

    // Retrieve valid jobs
    const validJobs = await validJob();

    // Filter jobs based on the query
    const filteredJobs = validJobs.filter((job) => {
      const { title, skills, location, jobType } = job;
      return (
        title.match(new RegExp(keyword, "i")) &&
        (!skill || skills.includes(skill)) &&
        (!location || location.match(new RegExp(location, "i"))) &&
        (!jobType || jobType === jobType)
      );
    });

    res.json({ data: filteredJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//Find matching Job
exports.findMatchingJobs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentDate = new Date(); // Get the current date

    // Find the resume based on the user's profile ID
    const resume = await Resume.findOne({ profile: userId });

    if (!resume) {
      throw new Error("Resume not found");
    }

    // Extract skills from the resume
    const { skills } = resume;

    // Find valid jobs
    const validJobs = await validJob();

    const matchingJobs = validJobs.filter((job) =>
      job.skills.some((skill) => skills.includes(skill))
    );

    // Sort matching jobs by date in descending order
    matchingJobs.sort((a, b) => b.datePosted - a.datePosted);

    // Limit the result to 5 jobs
    const limitedJobs = matchingJobs.slice(0, 5);

    res.json({ data: limitedJobs });
  } catch (error) {
    console.error("Error finding matching jobs:", error.message);
    res.status(500).json({ error: error.message }); // Sending error response
  }
};

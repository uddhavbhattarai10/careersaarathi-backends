const AppliedJob = require("../models/appliedJobModel");
const Job = require("../models/jobModel");
const Resume = require("../models/resumeModel");
const User = require("../models/userModel");
const Interview = require("../models/interviewModel");
const CompanyProfile = require("../models/companyModel");
const { transporter } = require("../config/nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Post Controller to Create a New Applied Job
exports.createAppliedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const resume = await Resume.findOne({ profile: userId });

    // Check if resume exists
    if (!resume) {
      return res
        .status(400)
        .json({ message: "Please create a resume before applying for a job" });
    }

    const jobId = req.params.id;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const appliedJobExists = await AppliedJob.findOne({
      resume: resume.id,
      job: jobId,
    });
    if (appliedJobExists) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job" });
    }

    const newAppliedJob = new AppliedJob({
      resume: resume.id,
      job: jobId,
      company: job.company,
    });
    await newAppliedJob.save();
    res.status(201).json({
      message: "Applied job  successfully",
      appliedJob: newAppliedJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteAppliedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const resume = await Resume.findOne({ profile: userId });
    const jobId = req.params.id;
    const appliedJob = await AppliedJob.findOneAndDelete({
      resume: resume.id,
      job: jobId,
    });

    if (!appliedJob) {
      return res.status(404).json({ error: "Applied job not found" });
    }

    res.status(200).json({ message: "Applied job deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllApplicant = async (req, res) => {
  const userId = req.user.userId;
  const jobId = req.params.id;

  try {
    const companyProfile = await CompanyProfile.findOne({ user: userId });

    // Populate both 'resume' and 'job' fields
    const applicantsWithResumesAndJobs = await AppliedJob.find({
      job: jobId,

      company: companyProfile._id,
      status: "Accepted",
    }).populate("resume");

    res.status(200).json({ data: applicantsWithResumesAndJobs });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
exports.getAllApplicantJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const applicants = await AppliedJob.find({
      job: jobId,
    })
      .populate("resume")
      .sort({ applicationDate: -1 }) // Sort by date in descending order
      .exec();

    res.status(200).json({ data: applicants });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// Controller to update the status of an applied job to "Accepted"
exports.acceptJobApplication = async (req, res) => {
  const appliedJobId = req.params.id;

  try {
    // Find the applied job by ID
    const appliedJob = await AppliedJob.findById(appliedJobId);
    if (!appliedJob) {
      return res.status(404).json({ message: "Applied job not found" });
    }

    // Update the status to "Accepted"
    appliedJob.status = "Accepted";
    await appliedJob.save();
    const resume = await Resume.findOne(appliedJob.resume.profile);
    const user = await User.findById(resume.profile);

    // Send email notification to the applicant
    await sendAcceptanceEmail(user.email);

    return res
      .status(200)
      .json({ message: "Job application accepted successfully" });
  } catch (error) {
    console.error("Error accepting job application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update the status of an applied job to "Rejected"
exports.rejectJobApplication = async (req, res) => {
  const appliedJobId = req.params.id; // Assuming you're passing appliedJobId as a parameter
  try {
    // Find the applied job by ID
    const appliedJob = await AppliedJob.findById(appliedJobId);

    if (!appliedJob) {
      return res.status(404).json({ message: "Applied job not found" });
    }

    // Update the status to "Rejected"
    appliedJob.status = "Rejected";
    await appliedJob.save();

    const resume = await Resume.findOne(appliedJob.resume.profile);
    const user = await User.findById(resume.profile);

    // Send email notification to the applicant
    await sendRejectionEmail(user.email);

    return res
      .status(200)
      .json({ message: "Job application rejected successfully" });
  } catch (error) {
    console.error("Error rejecting job application:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to send acceptance email
async function sendAcceptanceEmail(applicantEmail) {
  try {
    await transporter.sendMail({
      from: "careersarathifyp@gmail.com",
      to: applicantEmail,
      subject: "Your job application has been accepted",
      text: "Congratulations! Your job application has been accepted.",
      // You can add more details or HTML content as per your requirement
    });
    console.log("Acceptance email sent successfully to:", applicantEmail);
  } catch (error) {
    console.error("Error sending acceptance email:", error);
    throw error;
  }
}

// Function to send rejection email
async function sendRejectionEmail(applicantEmail) {
  try {
    await transporter.sendMail({
      from: "careersarathifyp@gmail.com",
      to: applicantEmail,
      subject: "Regarding your job application",
      text: "We regret to inform you that your job application has been rejected.",
      // You can add more details or HTML content as per your requirement
    });
    console.log("Rejection email sent successfully to:", applicantEmail);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw error;
  }
}

/*Interview Model */

exports.createInterview = async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Fetch the applied job and related data
    const appliedJob = await AppliedJob.findById(applicationId)
      .populate("resume")
      .populate({
        path: "job",
        populate: {
          path: "company",
          model: "CompanyProfile",
        },
      });

    if (!appliedJob) {
      return res.status(404).json({ error: "Application not found" });
    }

    const resume = await Resume.findById(appliedJob.resume);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const user = await User.findById(resume.profile);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update applied job to indicate an interview is scheduled
    appliedJob.isInterview = true;
    await appliedJob.save();

    const job = appliedJob.job;
    const company = job.company;

    // Extract job and company details
    const jobTitle = job.title;
    const address = job.location;
    const phone = company.phone;
    const companyName = company.name;

    // Create new interview instance with provided details
    const interviewDetails = {
      schedule: applicationId,
      Address: address,
      companyName: companyName,
      Phone: phone,
      jobTitle: jobTitle,
      ...req.body,
    };

    // Check if an interview already exists
    const existingInterview = await Interview.findOne({
      schedule: applicationId,
    });

    if (existingInterview) {
      // Update existing interview
      await Interview.findByIdAndUpdate(existingInterview._id, {
        $set: req.body,
      });
      console.log("Interview details updated successfully");

      // Send email about updated interview details
      await sendInterviewMail(
        user.email,
        interviewDetails,
        req.body,
        "Interview Details Updated"
      );

      res
        .status(200)
        .json({ message: "Interview details updated successfully" });
    } else {
      // Save new interview
      const newInterview = new Interview(interviewDetails);
      await newInterview.save();
      console.log("Interview created successfully");

      // Send email about new interview
      await sendInterviewMail(
        user.email,
        interviewDetails,
        req.body,
        "Congratulations! You Have an Interview"
      );

      res.status(201).json({ message: "Interview created successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

async function sendInterviewMail(
  applicantEmail,
  interviewDetails,
  schedule,
  subject
) {
  try {
    const { Address, jobTitle, companyName, Phone } = interviewDetails;
    const { Date, Time } = schedule;

    const mailOptions = {
      from: "careersarathifyp@gmail.com",
      to: applicantEmail,
      subject: subject,
      text: `Dear Applicant,\n\nCongratulations! You have been selected for an interview for the position of ${jobTitle} at ${companyName}.\n\nInterview Details:\nDate: ${Date}\nTime: ${Time}\nAddress: ${Address}\nPhone: ${Phone}\n\nPlease feel free to reach out through Company Phone above if you have any questions or concerns.\n\nBest regards,\nCareer Sarathi`,
    };
    console.log("Uddhav", mailOptions);
    await transporter.sendMail(mailOptions);
    console.log("Interview email sent successfully to:", applicantEmail);
  } catch (error) {
    console.error("Error sending interview email:", error);
    throw error;
  }
}

exports.getInterviewById = async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Find the interview by application ID
    const interview = await Interview.findOne({ schedule: applicationId });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.status(200).json({ data: interview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the resume for the current user
    const resume = await Resume.findOne({ profile: userId });

    // Check if the resume exists
    if (!resume) {
      console.log("Resume not found for the current user");
      return res
        .status(404)
        .json({ message: "Resume not found for the current user" });
    }

    // Find all applied jobs for the current user's resume
    const appliedJobs = await AppliedJob.find({ resume: resume.id })
      .populate("job")
      .populate("company")
      .sort({ applicationDate: -1 }) // Sort by date in descending order
      .exec();

    // If no applied jobs found, return an empty array
    if (!appliedJobs || appliedJobs.length === 0) {
      console.log("No applied jobs found for the current user");
      return res
        .status(404)
        .json({ message: "No applied jobs found for the current user" });
    }

    // Return the applied jobs with job details
    res.status(200).json({ data: appliedJobs });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Server error" });
  }
};
exports.totalApplied = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find the resume for the current user
    const resume = await Resume.findOne({ profile: userId });

    // Check if the resume exists
    if (!resume) {
      console.log("Resume not found for the current user");
      return res
        .status(404)
        .json({ message: "Resume not found for the current user" });
    }

    // Find all applied jobs for the current user's resume
    const appliedJobs = await AppliedJob.find({ resume: resume.id })
      .populate("job")
      .populate("company");

    // If no applied jobs found, return an empty array
    if (!appliedJobs || appliedJobs.length === 0) {
      console.log("No applied jobs found for the current user");
      return res
        .status(404)
        .json({ message: "No applied jobs found for the current user" });
    }

    // Count the total applied jobs, accepted jobs, and rejected jobs
    let totalAppliedJobs = appliedJobs.length;
    let acceptedJobs = 0;
    let rejectedJobs = 0;
    appliedJobs.forEach((job) => {
      if (job.status === "Accepted") {
        acceptedJobs++;
      } else if (job.status === "Rejected") {
        rejectedJobs++;
      }
    });

    res.status(200).json({
      totalAppliedJobs: totalAppliedJobs,
      acceptedJobs: acceptedJobs,
      rejectedJobs: rejectedJobs,
      data: appliedJobs,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Server error" });
  }
};

exports.currentApplicant = async (req, res) => {
  const applicantId = req.params.id;

  try {
    const applicantWithResumeAndJob = await AppliedJob.findById(
      applicantId
    ).populate("resume");

    if (!applicantWithResumeAndJob) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found." });
    }

    res.status(200).json({ success: true, data: applicantWithResumeAndJob });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
async function sendResumesToCompanyAndStoreInPdf(
  transporter,
  companyEmail,
  resumes
) {
  const pdfFileName = `resumes_${Date.now()}.pdf`;
  const pdfDoc = new PDFDocument();

  // Pipe the PDF output to a writable stream
  const stream = fs.createWriteStream(pdfFileName);
  pdfDoc.pipe(stream);

  resumes.forEach((resume, index) => {
    if (index > 0) {
      pdfDoc.addPage(); // Add a new page for each resume (except the first one)
    }

    // Add heading with resume number
    pdfDoc.fontSize(24).text(`Resume ${index + 1}`, { align: "center" });
    pdfDoc.moveDown(0.5);

    // Full Name
    if (resume.firstName && resume.lastName) {
      pdfDoc
        .fontSize(18)
        .text(`${resume.firstName} ${resume.lastName}`, { align: "center" });
      pdfDoc.moveDown(0.5);
    }

    // Contact Information
    const contactInfo = [];
    if (resume.address) contactInfo.push(resume.address);
    if (resume.phoneNumber) contactInfo.push(resume.phoneNumber);
    if (resume.emailAddress) contactInfo.push(resume.emailAddress);
    if (resume.linkedInProfile) contactInfo.push(resume.linkedInProfile);
    if (contactInfo.length > 0) {
      pdfDoc.fontSize(12).text(contactInfo.join(" | "));
      pdfDoc.moveDown(0.5);
    }

    // Summary
    if (resume.summary) {
      pdfDoc.fontSize(14).text("Summary:", { underline: true });
      pdfDoc.text(resume.summary);
      pdfDoc.moveDown(0.5);
    }

    // Skills
    if (resume.skills && resume.skills.length > 0) {
      pdfDoc.fontSize(14).text("Skills:", { underline: true });
      resume.skills.forEach((skill) => pdfDoc.text(`- ${skill}`));
      pdfDoc.moveDown(0.5);
    }

    // Work Experience
    if (resume.workExperience && resume.workExperience.length > 0) {
      pdfDoc.fontSize(14).text("Work Experience:", { underline: true });
      resume.workExperience.forEach((exp) => {
        pdfDoc.text(`${exp.jobTitle}, ${exp.companyName}`);
        pdfDoc.text(
          `${formatDate(exp.startDate)} - ${formatDate(
            exp.endDate || "Present"
          )}`
        );
        if (exp.responsibilities && exp.responsibilities.length > 0) {
          pdfDoc.text("Responsibilities:");
          exp.responsibilities.forEach((responsibility) =>
            pdfDoc.text(`- ${responsibility}`)
          );
        }
        pdfDoc.moveDown(0.5);
      });
    }

    // Education
    if (resume.education && resume.education.length > 0) {
      pdfDoc.fontSize(14).text("Education:", { underline: true });
      resume.education.forEach((edu) => {
        pdfDoc.text(`${edu.degreeEarned}, ${edu.institutionName}`);
        pdfDoc.text(
          `${formatDate(edu.startDate)} - ${formatDate(edu.graduationDate)}`
        );
        if (edu.academicAchievements && edu.academicAchievements.length > 0) {
          pdfDoc.text("Academic Achievements:");
          edu.academicAchievements.forEach((achievement) =>
            pdfDoc.text(`- ${achievement}`)
          );
        }
        pdfDoc.moveDown(0.5);
      });
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      pdfDoc.fontSize(14).text("Certifications:", { underline: true });
      resume.certifications.forEach((cert) => pdfDoc.text(`- ${cert}`));
      pdfDoc.moveDown(0.5);
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      pdfDoc.fontSize(14).text("Projects:", { underline: true });
      resume.projects.forEach((project) => {
        pdfDoc.text(project.projectName);
        if (project.role) pdfDoc.text(`Role: ${project.role}`);
        if (project.projectObjective)
          pdfDoc.text(`Objective: ${project.projectObjective}`);
        if (project.outcomes && project.outcomes.length > 0) {
          pdfDoc.text("Outcomes:");
          project.outcomes.forEach((outcome) => pdfDoc.text(`- ${outcome}`));
        }
        pdfDoc.moveDown(0.5);
      });
    }

    // Awards and Honors
    if (resume.awardsAndHonors && resume.awardsAndHonors.length > 0) {
      pdfDoc.fontSize(14).text("Awards and Honors:", { underline: true });
      resume.awardsAndHonors.forEach((award) => pdfDoc.text(`- ${award}`));
      pdfDoc.moveDown(0.5);
    }

    // Languages
    if (resume.languages && resume.languages.length > 0) {
      pdfDoc.fontSize(14).text("Languages:", { underline: true });
      resume.languages.forEach((language) => pdfDoc.text(`- ${language}`));
      pdfDoc.moveDown(0.5);
    }
  });

  pdfDoc.end();

  transporter.sendMail(
    {
      from: "careersarathifyp@gmail.com",
      to: companyEmail,
      subject: "Accepted Applicant Resumes",
      text: "Please find attached the resumes of the accepted applicants.",
      attachments: [{ filename: "resumes.pdf", path: pdfFileName }],
    },
    async (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent successfully:", info);
        // Delete the PDF file after sending email
        fs.unlink(pdfFileName, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting PDF file:", unlinkErr);
          } else {
            console.log("PDF file deleted successfully");
          }
        });
      }
    }
  );

  console.log("Resumes sent successfully to:", companyEmail);
}

// Function to format date to MM/YYYY format
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${month}/${year}`;
}

exports.sendAcceptedResumesToCompany = async (req, res) => {
  console.log("Hello");
  const jobId = req.params.id;
  console.log(jobId);

  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const acceptedApplications = await AppliedJob.find({
      job: jobId,
      status: "Accepted",
    })
      .populate({
        path: "company",
        populate: {
          path: "user",
          model: "User", // Assuming your User model is exported as 'User'
        },
      })
      .populate("resume");

    const resumes = acceptedApplications.map(
      (application) => application.resume
    );

    if (resumes.length === 0) {
      return res
        .status(404)
        .json({ message: "No accepted resumes found for this job" });
    }

    const companyEmails = acceptedApplications.map(
      (application) => application.company.user.email
    );

    for (const companyEmail of companyEmails) {
      await sendResumesToCompanyAndStoreInPdf(
        transporter,
        companyEmail,
        resumes
      );
    }

    return res
      .status(200)
      .json({ message: "Accepted resumes sent to companies successfully" });
  } catch (error) {
    console.error("Error sending accepted resumes to companies:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

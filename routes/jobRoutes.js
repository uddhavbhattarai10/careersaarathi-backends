const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authenticateJWT = require("../middlewares/authMiddleware");

// Create a new job
router.post("/job", authenticateJWT, jobController.createJob);

// Get all jobs
router.get("/job", jobController.getAllJobsWithCompanyDetails);
router.get("/job-applicant", jobController.getAllJobsWithApplicant);

router.get("/alljob", jobController.getALlJobs);
router.get("/total-job", authenticateJWT, jobController.totaljobCompany);
// Get jobs by user (assuming this is for employer-specific jobs)
router.get("/job/user", authenticateJWT, jobController.getJobsByUser);

// Get a specific job by ID
router.get("/:id", jobController.jobById);

router.get("/jobs/search", jobController.searchJobs);

//Get info
router.get(
  "/matching-job/user",
  authenticateJWT,
  jobController.findMatchingJobs
);

// Update a job by ID
router.put("/job/:id", authenticateJWT, jobController.updateJobById);
router.put("/status/:id", authenticateJWT, jobController.updateJobStatus);

// Delete a job by ID
router.delete("/job/:id", authenticateJWT, jobController.deleteJobById);

module.exports = router;

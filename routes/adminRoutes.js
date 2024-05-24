const express = require("express");
const router = express.Router();
const {
  getJobseekerUsersWithResume,
  getEmployerUsersWithCompanyProfiles,
  banUser,
  unbanUser,
  getJobseekerProfile,
  getCompanyProfile,
} = require("../controllers/adminController");

// Routes for fetching users
router.get("/jobseekers", getJobseekerUsersWithResume);
router.get("/employers", getEmployerUsersWithCompanyProfiles);
router.get("/jobseeker-details/:id", getJobseekerProfile);
router.get("/company-details/:id", getCompanyProfile);

// Routes for banning and unbanning users
router.post("/ban/:id", banUser);
router.post("/unban/:id", unbanUser);

module.exports = router;

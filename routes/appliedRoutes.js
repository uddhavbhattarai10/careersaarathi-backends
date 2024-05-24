const express = require("express");
const router = express.Router();
const appliedJobController = require("../controllers/appliedJobController");
const authenticateJWT = require("../middlewares/authMiddleware");

// Route to create a new applied job
router.post(
  "/applied-jobs/:id",
  authenticateJWT,
  appliedJobController.createAppliedJob
);
router.delete(
  "/applied-jobs/:id",
  authenticateJWT,
  appliedJobController.deleteAppliedJob
);

// Route to update the status of an applied job
router.get(
  "/get-application/:id",
  authenticateJWT,
  appliedJobController.getAllApplicant
);
router.get(
  "/get-applied-job/:id",
  authenticateJWT,
  appliedJobController.getAllApplicantJob
);
router.put(
  "/accept-applied-job/:id",
  authenticateJWT,
  appliedJobController.acceptJobApplication
);
router.put(
  "/reject-applied-job/:id",
  authenticateJWT,
  appliedJobController.rejectJobApplication
);
router.post(
  "/set-interview/:id",
  authenticateJWT,
  appliedJobController.createInterview
);
router.put(
  "/set-interview/:id",
  authenticateJWT,
  appliedJobController.createInterview
);
router.get(
  "/get-interview/:id",
  authenticateJWT,
  appliedJobController.getInterviewById
);
router.get(
  "/all-applied",
  authenticateJWT,
  appliedJobController.getAllAppliedJobs
);
router.get(
  "/total-applied",
  authenticateJWT,
  appliedJobController.totalApplied
);
router.get(
  "/current-applicant/:id",
  authenticateJWT,
  appliedJobController.currentApplicant
);
router.post(
  "/send-resumes/:id",

  appliedJobController.sendAcceptedResumesToCompany
);
module.exports = router;

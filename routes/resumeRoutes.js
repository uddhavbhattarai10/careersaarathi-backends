const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const authenticateJWT = require("../middlewares/authMiddleware");
const resumeController = require("../controllers/resumeController");

// POST route to create a new resume
router.post("/resume", authenticateJWT, resumeController.createResume);

// PUT route to update an existing resume
router.put(
  "/resume",
  authenticateJWT,
  upload.single("picture"),
  resumeController.updateResume
);

// GET route to get the resume for the current user
router.get(
  "/resume/me",
  authenticateJWT,
  upload.single("picture"),
  resumeController.getResumeForCurrentUser
);
router.post(
  "/upload-pdf",
  authenticateJWT,
  upload.single("pdfFile"),
  resumeController.uploadPdf
);

// GET route to search for resumes based on criteria
router.get("/resumes", resumeController.searchResumes);
// router.get('/resumes/:id', resumeController.getResumeById);

module.exports = router;

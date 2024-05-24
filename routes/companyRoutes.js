const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authenticateJWT = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

// Route to create a new company profile
router.post(
  "/profile",
  upload.single("picture"),
  authenticateJWT,
  companyController.createCompanyProfile
);

// Route to update an existing company profile
router.put(
  "/profile",
  upload.single("picture"),
  authenticateJWT,
  companyController.updateCompanyProfile
);

// Route to get the company profile for the current user
router.get(
  "/profile/me",
  authenticateJWT,
  companyController.getCompanyProfileForCurrentUser
);
router.get("/company/all", companyController.getAllCompanyProfiles);

// Route to get all company profiles
router.get("/get-information", companyController.totalInfo);

module.exports = router;

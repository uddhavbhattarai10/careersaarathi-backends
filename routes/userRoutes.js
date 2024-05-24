const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// Change 'app' to 'router' for defining routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.put(
  "/update-user-password",
  authenticateJWT,
  userController.updateUserPassword
); // Fixed typo: updateUserPassword
router.get("/logout", userController.logout);
router.post("/verify-email", userController.verifyEmail); // Changed route name to snake_case
// Route for sending verification code to reset password
router.post("/forgot-password", userController.forgotPassword);

// Route for verifying verification code and updating password
router.post("/verify-verification-code", userController.verifyVerificationCode);
router.post("/update-forgot-password", userController.UpdateForgotPassword);

// Route to delete a jobseeker
router.delete("/jobseeker", authenticateJWT, userController.deleteJobseeker);

// Route to delete an employer
router.delete("/employer", authenticateJWT, userController.deleteEmployer);

module.exports = router;

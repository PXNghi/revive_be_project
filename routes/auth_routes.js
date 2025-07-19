const express = require("express");
const authController = require("../controllers/auth_controller");
const { identifier } = require("../middlewares/identification");

const router = express.Router();

router.post("/register", authController.signUp);
router.post("/confirmed-verification-code", authController.confirmVerificationCode);
router.post("/login", authController.signIn);
router.post("/logout", identifier, authController.signOut);
router.post("/send-verification-code", authController.sendVerificationCode);
router.patch("/change-password", identifier, authController.changePassword);
router.patch("/forgot-password", authController.sendForgotPasswordCode);
router.post("/confirm-forgot-verification-code", authController.confirmForgotVerificationCode);
router.patch("/reset-password", authController.resetPassword);


module.exports = router;
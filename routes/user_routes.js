const express = require("express");
const userController = require("../controllers/user_controller");
const { authMiddleware } = require("../middlewares/auth_middlewares");

const router = express.Router();

router.get("/get-profile-by-token", authMiddleware, userController.getProfileByToken);
router.put("/update-user-profile-by-id/:id", userController.updateUserById);
router.post("/update-user-address", authMiddleware, userController.updateUserAddress);
router.patch("/unactivate-account/:id", authMiddleware, userController.unactivateUser);
router.patch("/activate-account/:id", authMiddleware, userController.activateUser);
router.post("/reset-password-admin", authMiddleware, userController.resetPasswordAdmin);
router.put("/update-profile", authMiddleware, userController.updateProfile);
router.get("/get-all-users", userController.getAllUsers);
router.get("/get-user-by-id/:id", userController.getUserById);

module.exports = router;

const express = require("express");
const userController = require("../controllers/user_controller");
const { authMiddleware } = require("../middlewares/auth_middlewares");

const router = express.Router();

router.get("/get-profile-by-token", authMiddleware, userController.getProfileByToken);
router.put("/update-user-profile-by-id/:id", userController.updateUserById);
router.post("/update-user-address", authMiddleware, userController.updateUserAddress);

module.exports = router;

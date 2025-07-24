const express = require("express");
const userController = require("../controllers/user_controller");
const { authMiddleware } = require("../middlewares/auth_middlewares");

const router = express.Router();

router.get("/get-profile-by-token", authMiddleware, userController.getProfileByToken);

module.exports = router;

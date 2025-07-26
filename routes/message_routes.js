const express = require("express");
const router = express.Router();
// const messageController = require("../controllers/messageController");
const { authMiddleware } = require("../middlewares/auth_middlewares"); // giả sử có middleware xác thực
const { getAllConversation, getConversationById } = require("../controllers/message_controller");
router.get("/conversation/:conversationId", authMiddleware, getConversationById);
router.get("/conversations", authMiddleware, getAllConversation);

module.exports = router;

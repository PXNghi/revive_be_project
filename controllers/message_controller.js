const Conversation = require("../models/conversation_model");
const Message = require("../models/message_model");
const User = require("../models/user_model");

exports.getAllConversation = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUserRole = req.user.role;

        // Lấy toàn bộ conversation liên quan
        const query = {
            "participants.userId": currentUserId,
        };

        const conversations = await Conversation.find(query)
            .populate("lastMessage")
            .populate("participants.userId", "full_name image role")
            .sort({ updated_at: -1 });

        // Nếu là user thường, chỉ lấy 1
        const filteredConversations =
            currentUserRole === "User" ? conversations.slice(0, 1) : conversations;

        // Format response
        const result = filteredConversations.map((conv) => {
            const unreadInfo = conv.unreadCounts.find((u) =>
                u.userId.equals(currentUserId)
            );

            return {
                _id: conv._id,
                participants: conv.participants,
                lastMessage: conv.lastMessage || null,
                unreadCount: unreadInfo?.count || 0,
                updatedAt: conv.updatedAt,
            };
        });

        return res.status(200).json(result);
    }
    catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


exports.getConversationById = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const { conversationId } = req.params;

        // Kiểm tra tồn tại cuộc trò chuyện
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Cập nhật trạng thái tin nhắn chưa đọc -> đã đọc
        await Message.updateMany(
            {
                conversationId,
                senderRole: { $ne: req.user.role },
                isRead: false
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date()
                }
            }
        );

        // Reset số lượng tin nhắn chưa đọc của user trong conversation
        await Conversation.updateOne(
            {
                _id: conversationId,
                "unreadCounts.userId": currentUserId
            },
            {
                $set: {
                    "unreadCounts.$.count": 0
                }
            }
        );

        // Trả về danh sách tin nhắn đã đọc
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 })
            .populate("senderId", "full_name image role");

        return res.status(200).json({
            conversationId,
            messages
        });
    } catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



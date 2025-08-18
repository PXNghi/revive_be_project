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

        return res.status(200).json({ success: true, data: result});
    }
    catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

exports.getConversationById = async (req, res) => {
    try {   
        const currentUserId = req.user._id;
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;

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

        // Reset số lượng tin nhắn chưa đọc
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

        // Tính skip từ page và limit
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversationId })
            .sort({ created_at: -1 }) // tin mới nhất trước
            .skip(skip)
            .limit(limit)
            .populate("senderId", "full_name image role");

        const totalMessages = await Message.countDocuments({ conversationId });
        const totalPages = Math.ceil(totalMessages / limit);

        return res.status(200).json({
            success: true,
            conversationId,
            messages,
            page,
            totalPages,
            totalMessages
        });
    } catch (error) {
        console.log("Error in getConversationById:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
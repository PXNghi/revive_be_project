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

// exports.getAllConversation = async (req, res) => {
//     try {
//         const currentUserId = req.user._id;
//         const currentUserRole = req.user.role;

//         const query = {
//             "participants.userId": currentUserId,
//         };

//         const conversations = await Conversation.find(query)
//             .populate("lastMessage")
//             .populate("participants.userId", "full_name image role")
//             .sort({ updated_at: -1 });

//         let filteredConversations;

//         if (currentUserRole === "User") {
//             // User thường -> chỉ lấy duy nhất 1 conversation
//             filteredConversations = conversations.slice(0, 1);
//         } else {
//             // Admin -> nhóm theo khách hàng (participant không phải admin)
//             const seenCustomers = new Set();
//             filteredConversations = conversations.filter(conv => {
//                 const customer = conv.participants.find(
//                     p => p.userId._id.toString() !== currentUserId.toString() && p.userId.role === "User"
//                 );
//                 if (!customer) return false;

//                 if (seenCustomers.has(customer.userId._id.toString())) {
//                     return false; // đã có rồi
//                 }
//                 seenCustomers.add(customer.userId._id.toString());
//                 return true;
//             });
//         }

//         const result = filteredConversations.map(conv => {
//             const unreadInfo = conv.unreadCounts.find(
//                 u => u.userId.equals(currentUserId)
//             );
//             return {
//                 _id: conv._id,
//                 participants: conv.participants,
//                 lastMessage: conv.lastMessage || null,
//                 unreadCount: unreadInfo?.count || 0,
//                 updatedAt: conv.updatedAt,
//             };
//         });

//         return res.status(200).json({ success: true, data: result });
//     }
//     catch (error) {
//         console.log("Error in getAllConversation:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };



exports.getConversationById = async (req, res) => {
    try {   
        const currentUserId = req.user._id;
        const { conversationId } = req.params;

        // Kiểm tra cuộc trò chuyện đã tồn tại hay chưa
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
            .sort({ created_at: -1 })
            .populate("senderId", "full_name image role");

        return res.status(200).json({
            success: true,
            conversationId,
            messages
        });
    } catch (error) {
        console.log("Error in sendMessage:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}



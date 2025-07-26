const Conversation = require("../models/conversation_model");
const Message = require("../models/message_model");
const User = require("../models/user_model");
const onlineUsers = new Map();
async function initSocketIO(io) {
    // Initialize the socket.io server
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Lưu userId vào onlineUsers khi họ login hoặc connect
        socket.on('register_user', (userId) => {
            onlineUsers.set(userId.toString(), socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });
        // Nhận message từ client
        socket.on('send_message', async ({ conversionId, senderId, receiverId, content, type = 'text', fileUrl = null }) => {
            console.log('📨 Received from client:', content);
            const sender = await User.findById(senderId);
            const receiver = await User.findById(receiverId);
            let conversation = await Conversation.findById(conversionId);
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [
                        { userId: sender._id, role: sender.role },
                        { userId: receiver._id, role: receiver.role }
                    ],
                    unreadCounts: [
                        { userId: sender._id, count: 0 },
                        { userId: receiver._id, count: 0 } // hoặc 0 tùy theo logic
                    ]
                });
            }

            const newMessage = await Message.create({
                conversationId: conversation._id,
                senderId: sender._id,
                senderRole: sender.role,
                content,
                type,         // "text", "image", "file"
                fileUrl       // URL của ảnh hoặc file nếu có
            });

            await Conversation.updateOne(
                { _id: conversation._id, "unreadCounts.userId": receiverId },
                {
                    $inc: { "unreadCounts.$.count": 1 },
                    $set: { lastMessage: newMessage._id },
                }
            )

            const receiverSocket = onlineUsers.get(receiverId.toString());
            if (receiverSocket) {
                io.to(receiverSocket).emit("receive-message", { message: newMessage });
            }
            // Gửi lại message cho tất cả client (bao gồm cả người gửi)
            socket.emit("message-sent", { message: newMessage });
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            // Xóa userId ra khỏi danh sách online khi disconnect
            for (const [userId, socketId] of onlineUsers) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });

    console.log('Socket.IO initialized');
}

module.exports = {
    initSocketIO,
}
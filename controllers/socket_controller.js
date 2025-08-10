const Conversation = require("../models/conversation_model");
const Message = require("../models/message_model");
const User = require("../models/user_model");
const onlineUsers = new Map();
async function initSocketIO(io) {
	// Initialize the socket.io server
	io.on("connection", (socket) => {
		console.log("A user connected:", socket.id);

		// Lưu userId vào onlineUsers khi họ login hoặc connect
		socket.on("register_user", (userId) => {
			onlineUsers.set(userId.toString(), socket.id);
			console.log(`User ${userId} registered with socket ${socket.id}`);
		});
		// Nhận message từ client
		// socket.on('send_message', async ({ conversionId, senderId, receiverId, content, type = 'text', fileUrl = null }) => {
		//     console.log('📨 Received from client:', content);
		//     const sender = await User.findById(senderId);
		//     const receiver = await User.findById(receiverId);
		//     let conversation = await Conversation.findById(conversionId);
		//     if (!conversation) {
		//         conversation = await Conversation.create({
		//             participants: [
		//                 { userId: sender._id, role: sender.role },
		//                 { userId: receiver._id, role: receiver.role }
		//             ],
		//             unreadCounts: [
		//                 { userId: sender._id, count: 0 },
		//                 { userId: receiver._id, count: 0 } // hoặc 0 tùy theo logic
		//             ]
		//         });
		//     }

		//     const newMessage = await Message.create({
		//         conversationId: conversation._id,
		//         senderId: sender._id,
		//         senderRole: sender.role,
		//         content,
		//         type,         // "text", "image", "file"
		//         fileUrl       // URL của ảnh hoặc file nếu có
		//     });

		//     await Conversation.updateOne(
		//         { _id: conversation._id, "unreadCounts.userId": receiverId },
		//         {
		//             $inc: { "unreadCounts.$.count": 1 },
		//             $set: { lastMessage: newMessage._id },
		//         }
		//     )

		//     const receiverSocket = onlineUsers.get(receiverId.toString());
		//     if (receiverSocket) {
		//         io.to(receiverSocket).emit("receive-message", { message: newMessage });
		//     }
		//     // Gửi lại message cho tất cả client (bao gồm cả người gửi)
		//     socket.emit("message-sent", { message: newMessage });
		// });
		socket.on(
			"send_message",
			async ({
				conversionId,
				senderId,
				content,
				type = "text",
				fileUrl = null,
			}) => {
				console.log("Received from client:", content);

				const sender = await User.findById(senderId);
				if (!sender) return;

				let receiver;

				if (sender.role === "User") {
					// Tìm admin (nếu chỉ có 1 admin thì lấy cái đầu tiên)
					receiver = await User.findOne({ role: "Admin" });
				} else if (sender.role === "Admin") {
					// Nếu admin gửi tin → lấy user từ conversation
					const conv = await Conversation.findById(conversionId);
					if (conv) {
						const userParticipant = conv.participants.find(
							(p) => p.role === "User"
						);
						if (userParticipant) {
							receiver = await User.findById(
								userParticipant.userId
							);
						}
					}
				}

				if (!receiver) {
					console.error("Không tìm thấy receiver!");
					return;
				}
                if (conversionId === "") {
                    conversionId = await Conversation.create({
                        participants: [
                            { userId: sender._id, role: sender.role },
                            { userId: receiver._id, role: receiver.role },
                        ],
                        unreadCounts: [
                            { userId: sender._id, count: 0 },
                            { userId: receiver._id, count: 0 },
                        ],
                    });
                }
				let conversation = await Conversation.findById(conversionId);
				if (!conversation) {
					conversation = await Conversation.create({
						participants: [
							{ userId: sender._id, role: sender.role },
							{ userId: receiver._id, role: receiver.role },
						],
						unreadCounts: [
							{ userId: sender._id, count: 0 },
							{ userId: receiver._id, count: 0 },
						],
					});
				}

				const newMessage = await Message.create({
					conversationId: conversation._id,
					senderId: sender._id,
					senderRole: sender.role,
					content,
					type,
					fileUrl,
				});

				await Conversation.updateOne(
					{
						_id: conversation._id,
						"unreadCounts.userId": receiver._id,
					},
					{
						$inc: { "unreadCounts.$.count": 1 },
						$set: { lastMessage: newMessage._id },
					}
				);

				const receiverSocket = onlineUsers.get(receiver._id.toString());
				if (receiverSocket) {
					// io.to(receiverSocket).emit("receive-message", {
					// 	message: newMessage,
					// });

					io.to(receiverSocket).emit("receive-message", {
						message: newMessage,
						conversation: {
							_id: conversation._id,
							lastMessage: newMessage,
							unreadCount: 1,
							participants: conversation.participants,
							updatedAt: conversation.updatedAt,
						},
					});
				}

				socket.emit("message-sent", { message: newMessage });
			}
		);

		// Handle disconnection
		socket.on("disconnect", () => {
			// Xóa userId ra khỏi danh sách online khi disconnect
			for (const [userId, socketId] of onlineUsers) {
				if (socketId === socket.id) {
					onlineUsers.delete(userId);
					break;
				}
			}
			console.log("User disconnected:", socket.id);
		});
	});

	console.log("Socket.IO initialized");
}

module.exports = {
	initSocketIO,
};

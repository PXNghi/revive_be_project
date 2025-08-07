const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
	{
		conversationId: {
			type: Schema.Types.ObjectId,
			ref: "Conversation",
			required: true,
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		senderRole: {
			type: String,
			enum: ["User", "Admin"],
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		readAt: {
			type: Date,
			default: null,
		},
		type: {
			type: String,
			enum: ["text", "image", "file"],
			default: "text"
		},
		fileUrl: String,
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

module.exports = mongoose.model("Message", messageSchema);

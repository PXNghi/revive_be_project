const mongoose = require("mongoose");
const { Schema } = mongoose;

const conversationSchema = new Schema(
	{
		participants: [
			{
				userId: {
					type: Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				role: {
					type: String,
					enum: ["User", "Admin"],
					required: true,
				},
			},
		],
		lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
		unreadCounts: [
			{
				userId: {
					type: Schema.Types.ObjectId,
					ref: "User",
				},
				count: {
					type: Number,
					default: 0,
				},
			},
		],
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

module.exports = mongoose.model("Conversation", conversationSchema);

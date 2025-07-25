const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
	{
		district: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		location: {
			lat: { type: Number, required: true },
			lon: { type: Number, required: true },
		},
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

module.exports = mongoose.model("Branch", branchSchema);

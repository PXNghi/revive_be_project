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
			type: {
				type: String,
				enum: ["Point"],
				required: true,
				default: "Point",
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true,
			},
		},
	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

branchSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Branch", branchSchema);

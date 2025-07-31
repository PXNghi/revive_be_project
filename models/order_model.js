const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
        userName: {
            type: String,
            required: true,
        },
        userPhone: {
            type: String,
            required: true,
        },
        userAddress: {
            type: String,
            required: true,
        },
        pickupDate: {
            type: Date,
            required: true,
        },
        collectOption: {
            type: String,
            enum: ["Pickup", "ComeBranch"],
            required: true,
        },
        adminNote: {
            type: String,
        },
        userNote: {
            type: String,
        },
        totalPrice: {
            type: Number,
        },
		branchProcess: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Branch",
		},
		status: {
			type: String,
			enum: [
				"cancelled",
				"waiting",
				"confirmed",
				"delivering",
				"finished",
			],
			required: true,
		},

	},
	{
		timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
	}
);

module.exports = mongoose.model("Order", orderSchema);

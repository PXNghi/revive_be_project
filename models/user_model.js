const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		full_name: {
			type: String,
			required: true,
			trim: true,
		},

		email: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},

		password: {
			type: String,
			required: true,
            select: false
		},
		
		phone: {
			type: String,
			trim: true,
		},

        image: {
            type: String,
        },

        verified: {
            type: Boolean,
            default: false
        },

        role: {
			type: String,
			default: "User"
		},

		verificationCode: {
			type: String,
			select: false,
		},

		verificationCodeValidation: {
			type: Number,
			select: false,
		},

		forgetPasswordCode: {
			type: String,
			select: false,
		},

		forgetPasswordCodeValidation: {
			type: Number,
			select: false,
		},
	},
	{
		timestamps: {createdAt: "created_at", updatedAt: "updated_at"},
	}
);

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        category_name: {
            type: String,
            required: true,
        },
        category_description: {
            type: String,
        },
        category_image: {
            type: String,
        },
        category_amount: {
            type: Number,
        }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

module.exports = mongoose.model("Category", categorySchema);
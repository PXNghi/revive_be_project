const express = require("express");
const fs = require("fs");
const path = require("path");
const Product = require("../models/product_model");
const Category = require("../models/category_model");

const router = express.Router();

router.delete("/", async (req, res) => {
	const { filename, type } = req.body;

	if (!filename || !type) {
		return res.status(400).json({ message: "Missing filename or type." });
	}

	const safeFilename = path.basename(filename);
	const filePath = path.join(__dirname, "../public/product", safeFilename);

	fs.unlink(filePath, async (err) => {
		if (err) {
			return res.status(404).json({ message: "File deletion failed." });
		}

		let result;
		const imagePath = `/public/product/${safeFilename}`;

		if (type === "product") {
			result = await Product.updateMany(
				{ images: imagePath },
				{ $pull: { images: imagePath } }
			);
		} else if (type === "category") {
			result = await Category.updateMany(
				{ image: imagePath },
				{ $set: { image: "" } }
			);
		} else {
			return res.status(400).json({ message: "Invalid type." });
		}

		return res.status(200).json({
			message: `File deleted and ${type} updated successfully.`,
			modifiedCount: result.modifiedCount,
		});
	});
});

module.exports = router;

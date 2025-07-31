const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.delete("/", (req, res) => {
    const { filename } = req.body;

    if (!filename) {
        return res.status(400).json({ message: "Missing filename in request body." });
    }

    const filePath = path.join(__dirname, "../public/product", filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Error deleting file:", err);
            return res.status(404).json({ message: "File not found or deletion failed." });
        }

        return res.status(200).json({ message: "File deleted successfully." });
    });
});

module.exports = router;

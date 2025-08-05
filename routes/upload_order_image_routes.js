const express = require("express");
const router = express.Router();
const uploadOrder = require("../middlewares/upload_order_image");

router.post("/", uploadOrder.array("images", 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    const fileUrls = req.files.map(file => `/public/order/${file.filename}`);
    res.status(200).json({ urls: fileUrls });
});

module.exports = router;

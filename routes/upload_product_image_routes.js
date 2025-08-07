const express = require("express");
const router = express.Router();
const uploadProduct = require("../middlewares/upload_product_image");

router.post("/", uploadProduct.array("images", 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
    }

    const fileUrls = req.files.map(file => `/public/product/${file.filename}`);
    res.status(200).json({ urls: fileUrls });
});

module.exports = router;

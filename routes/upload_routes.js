const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `/public/message/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
});
module.exports = router;

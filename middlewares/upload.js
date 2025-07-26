const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Tạo thư mục nếu chưa có
const uploadDir = path.join(__dirname, "../public/message");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Gỡ bỏ ký tự không hợp lệ trong tên file (tránh lỗi khi lưu)
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        cb(null, sanitizedName);
    },
});

const upload = multer({ storage });
module.exports = upload;

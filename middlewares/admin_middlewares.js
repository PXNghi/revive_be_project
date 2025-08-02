const User = require("../models/user_model");

exports.adminMiddleware = (req, res, next) => {
	try {
		if (!req.user) {
			return res
				.status(401)
				.json({ message: "Chưa xác thực người dùng." });
		}

		if (req.user.role !== "Admin") {
			return res
				.status(403)
				.json({ message: "Chỉ admin mới có quyền truy cập." });
		}

		next();
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ message: "Lỗi server" });
	}
};

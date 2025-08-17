const User = require("../models/user_model");
const geolib = require("geolib");
const { hashing } = require("../utils/hash_functions");

exports.getProfileByToken = async (req, res) => {
	try {
		const user = req.user;
		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.log("Error getProfileByToken: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.updateUserById = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = { ...req.body };

		// Nếu có address mới thì push vào mảng addresses
		if (req.body.address) {
			updateData.$push = {
				addresses: {
					address: req.body.address,
					location: null,
				},
			};
			delete updateData.address; // tránh bị set trực tiếp vào field address
		}

		const updatedUser = await User.findByIdAndUpdate(id, updateData, {
			new: true,
		});

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: updatedUser,
		});
	} catch (error) {
		console.log("Error updateUserById:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const MAX_DISTANCE_METERS = 100;
exports.updateUserAddress = async (req, res) => {
	try {
		const userId = req.user.id;
		const { lat, lon, address } = req.body;

		if (!lat || !lon || !address) {
			return res
				.status(400)
				.json({ message: "Thiếu thông tin location." });
		}

		const user = await User.findById(userId);
		if (!user)
			return res.status(404).json({ message: "Không tìm thấy user." });

		const isUnique = user.addresses.every((addr) => {
			const distance = geolib.getDistance(
				{ latitude: lat, longitude: lon },
				{
					latitude: addr.location.coordinates[1],
					longitude: addr.location.coordinates[0],
				}
			);
			return distance > MAX_DISTANCE_METERS;
		});

		if (isUnique) {
			user.addresses.push({
				address,
				// location: {
				// 	type: "Point",
				// 	coordinates: [lon, lat],
				// },
			});
			await user.save();
			return res.status(200).json({
				message: "Cập nhật địa chỉ mới thành công",
				addresses: user.addresses,
			});
		}

		return res.status(200).json({
			message: "Địa chỉ đã tồn tại gần đó, không cần thêm mới.",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Lỗi server khi cập nhật địa chỉ." });
	}
};

exports.unactivateUser = async (req, res) => {
	try {
		if (req.user.role !== "Admin") {
			return res
				.status(403)
				.json({ message: "Không có quyền thực hiện" });
		}
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy user" });
		}

		user.is_active = false;
		await user.save();

		return res
			.status(200)
			.json({ success: true, message: "Đã vô hiệu hóa user" });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: err.message || "Lỗi server" });
	}
};

exports.activateUser = async (req, res) => {
	try {
		if (req.user.role !== "Admin") {
			return res
				.status(403)
				.json({ message: "Không có quyền thực hiện" });
		}
		const userId = req.params.id;
		const user = await User.findById(userId);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy user" });
		}

		user.is_active = true;
		await user.save();

		return res
			.status(200)
			.json({ success: true, message: "Đã mở khóa user" });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: err.message || "Lỗi server" });
	}
};

exports.resetPasswordAdmin = async (req, res) => {
	try {
		if (req.user.role !== "Admin") {
			return res
				.status(403)
				.json({ message: "Không có quyền thực hiện" });
		}
		const { user_id, new_password } = req.body;
		if (!user_id || !new_password) {
			return res
				.status(400)
				.json({ message: "Thiếu thông tin cần thiết" });
		}

		const user = await User.findById(user_id);
		if (!user) {
			return res.status(404).json({ message: "Không tìm thấy user" });
		}

		const hashedPassword = await hashing(new_password, 12);
		user.password = hashedPassword;
		await user.save();

		return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: err.message || "Lỗi server" });
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "Không tìm thấy ID người dùng",
			});
		}

		const { full_name, phone, image, address } = req.body;

		const updateData = {};
		if (full_name) updateData.full_name = full_name;
		if (phone) updateData.phone = phone;
		if (image) updateData.image = image;
		if (address) {
			updateData.$push = { addresses: { address } };
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
			runValidators: true,
		}).select(
			"-password -verificationCode -verificationCodeValidation -forgetPasswordCode -forgetPasswordCodeValidation"
		);

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: "Không tìm thấy người dùng",
			});
		}

		return res.status(200).json({
			success: true,
			data: updatedUser,
		});
	} catch (error) {
		console.error("Lỗi tại updateProfile:", error.message);
		return res
			.status(500)
			.json({ success: false, message: "Lỗi server: " + error.message });
	}
};

exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select(
			"-password -verificationCode -verificationCodeValidation -forgetPasswordCode -forgetPasswordCodeValidation"
		);
		return res.status(200).json({ success: true, data: users });
	} catch (error) {
		console.error("Lỗi tại getAllUsers:", error.message);
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.getUserById = async (req, res) => {
	try {
		const userId = req.params.id;
		console.log(userId);
		const user = await User.findById(userId).select(
			"-password -verificationCode -verificationCodeValidation -forgetPasswordCode -forgetPasswordCodeValidation"
		);
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "Không tìm thấy người dùng" });
		}
		return res.status(200).json({ success: true, data: user });
	} catch (error) {
		console.log("Error getProfileByToken: ", error);
		return res.status(500).json({ success: false, message: error.message });
	}
};

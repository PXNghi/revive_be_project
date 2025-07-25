const User = require("../models/user_model");
const geolib = require("geolib");

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

		const updated = await User.findByIdAndUpdate(
			id,
			{ $set: req.body },
			{ new: true }
		);

		if (!updated) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		return res.status(200).json({
			success: true,
			data: updated,
		});
	} catch (error) {
		console.log("Error updateProfile: ", error);
		res.status(500).json({
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

		const lastAddress = user.addresses.at(-1);
		const isFar =
			!lastAddress ||
			geolib.getDistance(
				{ latitude: lat, longitude: lon },
				{
					latitude: lastAddress.location.coordinates[1],
					longitude: lastAddress.location.coordinates[0],
				}
			) > MAX_DISTANCE_METERS;

		if (isFar) {
			user.addresses.push({
				address,
				location: {
					type: "Point",
					coordinates: [lon, lat],
				},
			});

			await user.save();
			return res
				.status(200)
				.json({
					message: "Cập nhật địa chỉ mới thành công",
					addresses: user.addresses,
				});
		}

		return res
			.status(200)
			.json({
				message: "Địa chỉ gần giống địa chỉ cũ, không cần cập nhật.",
			});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Lỗi server khi cập nhật địa chỉ." });
	}
};

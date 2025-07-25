const User = require("../models/user_model");

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

exports.updateUserById= async (req, res) => {
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

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

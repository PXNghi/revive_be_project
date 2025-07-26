const jwt = require("jsonwebtoken");
const User = require("../models/user_model");
const { Types } = require("mongoose");

exports.authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
}

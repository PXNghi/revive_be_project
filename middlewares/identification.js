const jwt = require("jsonwebtoken");

exports.identifier = (req, res, next) => {
	let token = null;

    // priority to read token from authorization header
	if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
		token = req.headers.authorization.split(" ")[1];
	}

    // if not, read in cookie
	if (!token && req.cookies && req.cookies.Authorization) {
		token = req.cookies.Authorization;
	}

	if (!token) {
		return res.status(403).json({ success: false, message: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
		req.user = decoded;
		next();
	} catch (error) {
		console.log("Invalid token:", error.message);
		return res.status(403).json({ success: false, message: "Invalid or expired token" });
	}
};

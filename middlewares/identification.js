const jwt = require("jsonwebtoken");

// check if user logged in or not
exports.identifier = (req, res, next) => {
	let token;
    // if request comes from mobile app or third application
	if (req.headers.client === "not-browser") {
        console.log("not-browser");
        // take token from authorization header
		token = req.headers.authorization;
	} else {
        console.log("cookie");
        // take token from cookie
		token = req.cookies["Authorization"];
	}

	if (!token) {
		return res
			.status(403)
			.json({ success: false, message: "Unauthorized" });
	}

    try {
        const userToken = token.split(" ")[1]; // Bearer <token>. Get <token>
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
        if (jwtVerified) {
            req.user = jwtVerified;
            next();
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.log(error);
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
};

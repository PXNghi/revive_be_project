const mongoose = require("mongoose");
require("dotenv").config(); // nếu dùng biến môi trường

const Branch = require("../models/branch_model"); // đường dẫn đúng

(async () => {
	try {
		await mongoose.connect(process.env.MONGODB_CONNECT_STRING); // hoặc URI trực tiếp

		const result = await Branch.updateMany({}, [
			{
				$set: {
					location: {
						$cond: [
							{ $and: ["$location.lat", "$location.lon"] },
							{
								type: "Point",
								coordinates: ["$location.lon", "$location.lat"],
							},
							"$location",
						],
					},
				},
			},
		]);

		console.log("Update result:", result);
		process.exit(0);
	} catch (err) {
		console.error("Migration error:", err);
		process.exit(1);
	}
})();

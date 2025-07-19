const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGODB_CONNECT_STRING);
		console.log("Connect DB successfully");
	} catch (error) {
		console.log("error DB connect: ", error);
	}
};

module.exports = connectDB;

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());

app.listen(port, () => {
	console.log("listening on port", port);
});

// Connect MongoDB
// mongoose
// 	.connect(process.env.MONGO_URI, {
// 		useNewUrlParser: true,
// 		useUnifiedTopology: true,
// 	})
// 	.then(() => {
// 		console.log("MongoDB connected");
// 		app.listen(process.env.PORT || 5000, () => {
// 			console.log(`Server running on port ${process.env.PORT}`);
// 		});
// 	})
// 	.catch((err) => console.error(err));

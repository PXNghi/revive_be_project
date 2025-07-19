const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./configs/db.config");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());

app.listen(port, () => {
	console.log("listening on port", port);
});
connectDB();

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./configs/db.config");

dotenv.config();

const authRoutes = require("./routes/auth_routes");

const app = express();
const port = process.env.PORT || 8080;

// middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());

connectDB();

// routes
app.use("/api/auth", authRoutes);

app.listen(port, () => {
	console.log("listening on port", port);
});

app.get("/", (req, res) => {
	res.json({ message: "Hello World" });
});

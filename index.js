const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./configs/db.config");


const authRoutes = require("./routes/auth_routes");
const userRoutes = require("./routes/user_routes");

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
app.use("/api/user", userRoutes);

app.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on http://0.0.0.0:${port}`);
});

app.get("/", (req, res) => {
	res.json({ message: "Hello World" });
});

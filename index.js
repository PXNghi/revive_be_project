const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./configs/db.config");
const http = require('http');
const SocketIO = require('socket.io');
dotenv.config();

const { initSocketIO } = require('./controllers/socket_controller');

const authRoutes = require("./routes/auth_routes");
const userRoutes = require("./routes/user_routes");
const branchRoutes = require("./routes/branch_routes");
const messageRoutes = require("./routes/message_routes");
const uploadRoutes = require("./routes/upload_routes");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

var server = require('http').Server(app);

var io = require('socket.io')(server, {
	cors: {
		origin: '*',
	},
	maxHttpBufferSize: 8e6,
});

// middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());

connectDB();

app.use("/public", express.static(path.join(__dirname, "public")));
// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/upload", uploadRoutes);

initSocketIO(io);

server.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on http://0.0.0.0:${port}`);
});

app.get("/", (req, res) => {
	res.json({ message: "Hello World" });
});

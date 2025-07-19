const nodemailer = require("nodemailer");

const sendMail = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NODE_SENDING_EMAIL_ADDRESS,
		pass: process.env.NODE_SENDING_EMAIL_PASSWORD,
	},
});

module.exports = sendMail;
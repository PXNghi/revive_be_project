const User = require("../models/user_model");
const {
	hashing,
	compareHashPassword,
	hmacProcess,
} = require("../utils/hash_functions");
const jwt = require("jsonwebtoken");
const transport = require("../middlewares/send_mail");
const {
	signUpValidator,
	signInValidator,
	acceptVerificationCodeValidator,
} = require("../validators/auth_validators");
const { exist } = require("joi");

exports.signUp = async (req, res) => {
	const { full_name, email, password, confirmed_password } = req.body;
	try {
		const { error, value } = signUpValidator.validate(req.body);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const user = await User.findOne({ email });

		if (user) {
			return res
				.status(400)
				.json({ success: false, message: "Email already exists" });
		} else {
			if (password !== confirmed_password) {
				return res.status(400).json({
					success: false,
					message: "Password and confirmed password do not match",
				});
			} else {
				const hashedPassword = await hashing(password, 12);
				const newUser = new User({
					full_name,
					email,
					password: hashedPassword,
				});
				const savedUser = await newUser.save();

				// send verification mail
				const codeVerified = Math.floor(
					Math.random() * 1000000
				).toString();
				let emailContent = "<h2>Welcome to ReVive App</h2>";
				emailContent +=
					"<p>This is your verification code: " +
					codeVerified +
					"</p>";
				emailContent +=
					"<p>This code will be expired in 10 minutes. Please use it to confirm your account and do not share with anyone. Thank you!</p>";
				emailContent += "<p>Best regards,<br>ReVive App</p>";

				let info = await transport.sendMail({
					from: process.env.NODE_SENDING_EMAIL_ADDRESS,
					to: newUser.email,
					subject: "[ReVive App] Email Verification",
					html: emailContent,
				});

				if (info.accepted[0] === newUser.email) {
					const hashedCodeVerification = hmacProcess(
						codeVerified,
						process.env.HMAC_SECRET_KEY
					);
					newUser.verificationCode = hashedCodeVerification;
					newUser.verificationCodeValidation = Date.now();
					await newUser.save();
				}

				savedUser.password = undefined;
				savedUser.verificationCode = undefined;
				savedUser.verificationCodeValidation = undefined;

				return res.status(200).json({
					success: true,
					message: "Sign up successfully",
					data: {
						id: savedUser._id,
						savedUser,
					},
				});
			}
		}
	} catch (error) {
		console.log("Error signUp: ", error);
	}
};

exports.confirmVerificationCode = async (req, res) => {
	const { email, provided_code } = req.body;
	try {
		const { error, value } = acceptVerificationCodeValidator.validate(
			req.body
		);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const user = await User.findOne({ email }).select(
			"+verificationCode +verificationCodeValidation"
		);

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		if (user.verified) {
			return res
				.status(400)
				.json({ success: false, message: "User already verified" });
		}

		// verification code will be expired after 10 minutes
		if (Date.now() - user.verificationCodeValidation > 10 * 60 * 1000) {
			return res
				.status(400)
				.json({ success: false, message: "Verification code expired" });
		}

		const codeValue = provided_code.toString();
		const hashedCodeVerification = hmacProcess(
			codeValue,
			process.env.HMAC_SECRET_KEY
		);
		if (hashedCodeVerification === user.verificationCode) {
			user.verified = true;
			user.verificationCode = undefined;
			user.verificationCodeValidation = undefined;
			await user.save();
			return res
				.status(200)
				.json({ success: true, message: "User verified successfully" });
		} else {
			return res.status(400).json({
				success: false,
				message: "Something went wrong! Please try again",
			});
		}
	} catch (error) {
		console.log("Error confirmVerificationCode: ", error);
	}
};

exports.signIn = async (req, res) => {
	const { email, password } = req.body;
	try {
		const { error, value } = signInValidator.validate(req.body);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		if (!user.verified) {
			return res
				.status(400)
				.json({ success: false, message: "User not verified" });
		}

		const isMatchedPassword = await compareHashPassword(
			password,
			user.password
		);

		if (!isMatchedPassword) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid password" });
		} else {
			const token = jwt.sign(
				{
					userId: user._id,
					email: user.email,
					verified: user.verified,
				},
				process.env.TOKEN_SECRET_KEY,
				{
					expiresIn: "7d",
				}
			);

			user.password = undefined;

			return res.status(200).json({
				success: true,
				message: "Sign in successfully",
				data: {
					token,
					user,
				},
			});
		}
	} catch (error) {
		console.log("Error signIn: ", error);
	}
};

exports.signOut = async (req, res) => {
	try {
		return res
			.status(200)
			.json({ success: true, message: "Sign out successfully" });
	} catch (error) {
		console.log("Error signOut: ", error);
	}
};

exports.sendVerificationCode = async (req, res) => {
	const { email } = req.body;
	try {
		const { error, value } = sendVerificationCodeValidator.validate(
			req.body
		);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		if (user.verified) {
			return res
				.status(400)
				.json({ success: false, message: "User already verified" });
		}

		const code = Math.floor(Math.random() * 1000000);
		const hashedCode = hmacProcess(
			code.toString(),
			process.env.HMAC_SECRET_KEY
		);
		let emailContent = "<h2>Send verification code</h2>";
		emailContent +=
			"<p>This is your verification code: " + codeVerified + "</p>";
		emailContent +=
			"<p>This code will be expired in 10 minutes. Please use it to confirm your account and do not share with anyone. Thank you!</p>";
		emailContent += "<p>Best regards,<br>ReVive App</p>";

		let info = await transport.sendMail({
			from: process.env.NODE_SENDING_EMAIL_ADDRESS,
			to: user.email,
			subject: "[ReVive App] Send Verification Code",
			html: emailContent,
		});

		if (info.accepted[0] === user.email) {
			const hashedCodeVerification = hmacProcess(
				codeVerified,
				process.env.HMAC_SECRET_KEY
			);
			user.verificationCode = hashedCodeVerification;
			user.verificationCodeValidation = Date.now();
			await user.save();
		}

		return res.status(200).json({
			success: true,
			message: "Send verification code successfully",
		});
	} catch (error) {
		console.log("Error sendVerificationCode: ", error);
	}
};

exports.changePassword = async (req, res) => {
	const { userId, verified } = req.user;
	const { old_password, new_password, confirmed_password } = req.body;
	try {
		const { error, value } = changePasswordValidator.validate(req.body);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		if (!verified) {
			return res
				.status(400)
				.json({ success: false, message: "User not verified" });
		}

		const user = await User.findById(userId).select("+password");

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		if (new_password !== confirmed_password) {
			return res.status(400).json({
				success: false,
				message: "New password and confirmed password do not match",
			});
		} else {
			const hashedNewPassword = await hashing(new_password, 12);
			user.password = hashedNewPassword;
			await user.save();
			return res.status(200).json({
				success: true,
				message: "Change password successfully",
			});
		}
	} catch (error) {
		console.log("Error changePassword: ", error);
	}
};

exports.sendForgotPasswordCode = async (req, res) => {
	const { email } = req.body;
	try {
		const { error, value } = sendVerificationCodeValidator.validate(
			req.body
		);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		const code = Math.floor(Math.random() * 1000000);
		const hashedCode = hmacProcess(
			code.toString(),
			process.env.HMAC_SECRET_KEY
		);
		let emailContent = "<h2>Reset password</h2>";
		emailContent +=
			"<p>This is your verification code: " + codeVerified + "</p>";
		emailContent +=
			"<p>This code will be expired in 10 minutes. Please use it to reset your password and do not share with anyone. Thank you!</p>";
		emailContent += "<p>Best regards,<br>ReVive App</p>";

		let info = await transport.sendMail({
			from: process.env.NODE_SENDING_EMAIL_ADDRESS,
			to: user.email,
			subject: "[ReVive App] Send Verification Code",
			html: emailContent,
		});

		if (info.accepted[0] === user.email) {
			const hashedCodeVerification = hmacProcess(
				codeVerified,
				process.env.HMAC_SECRET_KEY
			);
			user.forgetPasswordCode = hashedCodeVerification;
			user.forgetPasswordCodeValidation = Date.now();
			await user.save();
			return res
				.status(200)
				.json({
					success: true,
					message: "Send verification code successfully",
				});
		} else {
			return res
				.status(400)
				.json({
					success: false,
					message: "Send verification code failed. Please try again",
				});
		}
	} catch (error) {}
};

exports.confirmForgotVerificationCode = async (req, res) => {
	const { email, provided_code } = req.body;
	try {
		const { error, value } = acceptVerificationCodeValidator.validate(
			req.body
		);

		if (error) {
			return res.status(400).json({ message: error.details[0].message });
		}

		const user = await User.findOne({ email }).select(
			"+forgetPasswordCode +forgetPasswordCodeValidation"
		);

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		if (!user.forgetPasswordCode || !user.forgetPasswordCodeValidation) {
			return res
				.status(400)
				.json({
					success: false,
					message:
						"Please go back and try to get verification code again with your email",
				});
		} else {
			if (
				Date.now() - user.forgetPasswordCodeValidation >
				10 * 60 * 1000
			) {
				return res.status(400).json({
					success: false,
					message: "Forgot password code has been expired!",
				});
			} else {
                const codeValue = provided_code.toString();
                const hashedCodeValue = hmacProcess(
                    codeValue,
                    process.env.HMAC_SECRET_KEY
                );
                if (hashedCodeValue === user.forgetPasswordCode) {
                    user.forgetPasswordCode = undefined;
                    user.forgetPasswordCodeValidation = undefined;
                    await user.save();
                    return res.status(200).json({
                        success: true,
                        message: "Confirm verification code successfully",
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: "Confirm verification code is not true. Please try again",
                    });
                }
            }
		}
	} catch (error) {
        console.log("Error confirmForgotVerificationCode: ", error);
    }
};

exports.resetPassword = async (req, res) => {
    const { email, new_password, confirmed_password } = req.body;
    try {
        const { error, value } = resetPasswordValidator.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        if (!user.forgetPasswordCode || !user.forgetPasswordCodeValidation) {
            if (new_password !== confirmed_password) {
                return res.status(400).json({
                    success: false,
                    message: "New password and confirmed password do not match",
                });
            } else {
                const hashedPassword = await hashing(new_password, 12);
                user.password = hashedPassword;
                await user.save();
                return res.status(200).json({
                    success: true,
                    message: "Reset password successfully",
                });
            }
        }
    } catch (error) {
        console.log("Error resetPassword: ", error);
    }
}

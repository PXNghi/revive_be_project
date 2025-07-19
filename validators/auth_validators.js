const Joi = require("joi");

exports.signUpValidator = Joi.object({
    full_name: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().required().min(6).pattern(new RegExp("(?=.*[A-Z])")),
    confirmed_password: Joi.string().required().min(6).pattern(new RegExp("(?=.*[A-Z])")),
});

exports.signInValidator = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

exports.acceptVerificationCodeValidator = Joi.object({
	email: Joi.string().email().required(),
	provided_code: Joi.number().required(),
});

exports.sendVerificationCodeValidator = Joi.object({
    email: Joi.string().email().required(),
});

exports.changePasswordValidator = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().required().min(6).pattern(new RegExp("(?=.*[A-Z])")),
    confirmed_password: Joi.string().required().min(6).pattern(new RegExp("(?=.*[A-Z])")),
});

exports.resetPasswordValidator = Joi.object({
    new_password: Joi.string().required().min(6).pattern(new RegExp("(?=.*[A-Z])")),
    confirmed_password: Joi.string().required().min(6).pattern(new RegExp("(?=.*[A-Z])")),
});

const { hash, compare } = require("bcryptjs");
const { createHmac } = require("crypto");

exports.hashing = (value, salt) => {
    const result = hash(value, salt);
    return result;
};

exports.compareHashPassword = (value, hashedValue) => {
    const result = compare(value, hashedValue);
    return result;
};

exports.hmacProcess = (value, secret) => {
    const result = createHmac("sha256", secret).update(value).digest("hex");
    return result;
};

